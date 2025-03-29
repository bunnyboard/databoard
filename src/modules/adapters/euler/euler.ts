import { EulerProtocolConfig } from '../../../configs/protocols/euler';
import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import EVaultAbi from '../../../configs/abi/euler/EVault.json';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { SolidityUnits, TimeUnits } from '../../../configs/constants';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import EulerMarketsAbi from '../../../configs/abi/euler/Markets.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { ContractCall } from '../../../services/blockchains/domains';

const EulerEvents = {
  Deposit: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',
  Withdraw: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
  Borrow: '0xcbc04eca7e9da35cb1393a6135a199ca52e450d5e9251cbd99f7847d33a36750',
  Repay: '0x5c16de4f8b59bd9caf0f49a545f25819a895ed223294290b408242e72a594231',
  Liquidate: '0x8246cc71ab01533b5bebc672a636df812f10637ad720797319d5741d5ebb3962',
};

const EulerV1Events = {
  Deposit: '0x5548c837ab068cf56a2c2479df0882a4922fd203edb7517321831d95078c5f62',
  Withdraw: '0x9b1bfa7fa9ee420a16e124f794c35ac9f90472acc99140eb2f6447c714cad8eb',
  Borrow: '0x312a5e5e1079f5dda4e95dbbd0b908b291fd5b992ef22073643ab691572c5b52',
  Repay: '0x05f2eeda0e08e4b437f487c8d7d29b14537d15e3488170dc3de5dbdf8dac4684',
  Liquidation: '0xbba0f1d6fb8b9abe2bbc543b7c13d43faba91c6f78da4700381c94041ac7267d',
};

const FixedRate: { [key: string]: number } = {
  '0xdd629e5241cbc5919847783e6c96b2de4754e438': 1, // fixed at $1
};

function containVault(vaults: Array<string>, vault: string): boolean {
  for (const item of vaults) {
    if (compareAddress(item, vault)) {
      return true;
    }
  }

  return false;
}

export default class EulerAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.euler';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      totalBorrowed: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        borrow: 0,
        repay: 0,
        liquidation: 0,
      },
    };

    const eulerConfig = this.protocolConfig as EulerProtocolConfig;

    if (eulerConfig.v1Config.birthday > options.timestamp) {
      return null;
    }

    // get v1 data
    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      eulerConfig.v1Config.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      eulerConfig.v1Config.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      eulerConfig.v1Config.chain,
      options.endTime,
    );
    const anchorBlock = eulerConfig.v1Config.anchorBlock > blockNumber ? blockNumber : eulerConfig.v1Config.anchorBlock;

    protocolData.breakdown[eulerConfig.v1Config.chain] = {};

    // get metadata of all tokens - underlying assets
    const getDTokensCalls: Array<ContractCall> = eulerConfig.v1Config.tokens.map((tokenAddress) => {
      return {
        abi: EulerMarketsAbi,
        target: eulerConfig.v1Config.marketProxy,
        method: 'underlyingToDToken',
        params: [tokenAddress],
      };
    });
    const getDTokensResults: Array<string> = await this.services.blockchain.evm.multicall({
      chain: eulerConfig.v1Config.chain,
      blockNumber: anchorBlock,
      calls: getDTokensCalls,
    });

    // get reserve fee
    const getReserveFeesCalls: Array<ContractCall> = eulerConfig.v1Config.tokens.map((tokenAddress) => {
      return {
        abi: EulerMarketsAbi,
        target: eulerConfig.v1Config.marketProxy,
        method: 'reserveFee',
        params: [tokenAddress],
      };
    });
    const getReserveFeesResults: Array<string> = await this.services.blockchain.evm.multicall({
      chain: eulerConfig.v1Config.chain,
      blockNumber: anchorBlock,
      calls: getReserveFeesCalls,
    });

    // get total supply of DTokens
    const getDTokensSupplyCalls: Array<ContractCall> = getDTokensResults.map((dTokenAddress) => {
      return {
        abi: Erc20Abi,
        target: dTokenAddress,
        method: 'totalSupply',
        params: [],
      };
    });
    const getDTokensSupplyResults: Array<string> = await this.services.blockchain.evm.multicall({
      chain: eulerConfig.v1Config.chain,
      blockNumber: blockNumber,
      calls: getDTokensSupplyCalls,
    });

    // get interest rates
    // before - beginBlock
    const before_getInterestAccumulatorCalls: Array<ContractCall> = eulerConfig.v1Config.tokens.map((tokenAddress) => {
      return {
        abi: EulerMarketsAbi,
        target: eulerConfig.v1Config.marketProxy,
        method: 'interestAccumulator',
        params: [tokenAddress],
      };
    });
    const before_getInterestAccumulatorResults: Array<string> = await this.services.blockchain.evm.multicall({
      chain: eulerConfig.v1Config.chain,
      blockNumber: beginBlock,
      calls: before_getInterestAccumulatorCalls,
    });
    // after - endBlock
    const after_getInterestAccumulatorCalls: Array<ContractCall> = eulerConfig.v1Config.tokens.map((tokenAddress) => {
      return {
        abi: EulerMarketsAbi,
        target: eulerConfig.v1Config.marketProxy,
        method: 'interestAccumulator',
        params: [tokenAddress],
      };
    });
    const after_getInterestAccumulatorResults: Array<string> = await this.services.blockchain.evm.multicall({
      chain: eulerConfig.v1Config.chain,
      blockNumber: endBlock,
      calls: after_getInterestAccumulatorCalls,
    });

    const tokens: Array<Token> = [];
    for (const tokenAddress of eulerConfig.v1Config.tokens) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: eulerConfig.v1Config.chain,
        address: tokenAddress,
      });
      if (token) {
        tokens.push(token);
      }
    }
    const getTokenBalances = await this.getAddressBalanceUsd({
      chain: eulerConfig.v1Config.chain,
      ownerAddress: eulerConfig.v1Config.protocolProxy,
      tokens: tokens,
      blockNumber: blockNumber,
      timestamp: options.timestamp,
    });

    for (let i = 0; i < eulerConfig.v1Config.tokens.length; i++) {
      const tokenAddress = normalizeAddress(eulerConfig.v1Config.tokens[i]);
      if (getTokenBalances.tokenBalanceUsds[tokenAddress]) {
        const token = getTokenBalances.tokenBalanceUsds[tokenAddress].token;
        const tokenPriceUsd = getTokenBalances.tokenBalanceUsds[tokenAddress].priceUsd;

        // default 23%
        // https://etherscan.io/address/0xE5d0A7A3ad358792Ba037cB6eE375FfDe7Ba2Cd1#code#F2#L220
        // https://etherscan.io/address/0xE5d0A7A3ad358792Ba037cB6eE375FfDe7Ba2Cd1#code#F14#L21
        const reserveFee = getReserveFeesResults[i]
          ? formatBigNumberToNumber(getReserveFeesResults[i].toString(), 0)
          : 920000000;
        const reserveFeeRate = reserveFee / 4000000000;

        // use 27 decimals
        // https://etherscan.io/address/0xE5d0A7A3ad358792Ba037cB6eE375FfDe7Ba2Cd1#code#F2#L213
        // https://etherscan.io/address/0xE5d0A7A3ad358792Ba037cB6eE375FfDe7Ba2Cd1#code#F14#L22
        const before_interestIndexRate = before_getInterestAccumulatorResults[i]
          ? formatBigNumberToNumber(before_getInterestAccumulatorResults[i].toString(), 27)
          : 1;
        const after_interestIndexRate = after_getInterestAccumulatorResults[i]
          ? formatBigNumberToNumber(after_getInterestAccumulatorResults[i].toString(), 27)
          : 1;
        const interestIndexRateDiff =
          after_interestIndexRate > before_interestIndexRate ? after_interestIndexRate - before_interestIndexRate : 0;

        // all dTokens have 18 decimals
        // WETH 18 decimals | dToken: 0x62e28f054efc24b26A794F5C1249B6349454352C - 18 decimals
        // USDC 6 decimals | dToken: 0x84721A3dB22EB852233AEAE74f9bC8477F8bcc42 - 18 decimals
        // WBTC 8 decimals | dToken: 0x36c4A49F624342225bA45fcfc2e1A4BcBCDcE557 - 18 decimals
        const totalBorrowedUsd =
          formatBigNumberToNumber(getDTokensSupplyResults[i] ? getDTokensSupplyResults[i].toString() : '0', 18) *
          tokenPriceUsd;

        const totalInterestUsd = interestIndexRateDiff * totalBorrowedUsd;
        const protocolRevenue = totalInterestUsd * reserveFeeRate;

        (protocolData.totalBorrowed as number) += totalBorrowedUsd;
        protocolData.totalFees += totalInterestUsd;
        protocolData.protocolRevenue += protocolRevenue;
        protocolData.supplySideRevenue += totalInterestUsd - protocolRevenue;
        if (!protocolData.breakdown[token.chain][token.address]) {
          protocolData.breakdown[token.chain][token.address] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            totalBorrowed: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              borrow: 0,
              repay: 0,
              liquidation: 0,
            },
          };
        }
        protocolData.breakdown[token.chain][token.address].totalAssetDeposited +=
          getTokenBalances.tokenBalanceUsds[tokenAddress].balanceUsd;
        protocolData.breakdown[token.chain][token.address].totalValueLocked +=
          getTokenBalances.tokenBalanceUsds[tokenAddress].balanceUsd - totalBorrowedUsd;
        (protocolData.breakdown[token.chain][token.address].totalSupplied as number) +=
          getTokenBalances.tokenBalanceUsds[tokenAddress].balanceUsd;
        (protocolData.breakdown[token.chain][token.address].totalBorrowed as number) += totalBorrowedUsd;
        protocolData.breakdown[token.chain][token.address].totalFees += totalInterestUsd;
        protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolRevenue;
        protocolData.breakdown[token.chain][token.address].supplySideRevenue += totalInterestUsd - protocolRevenue;
      }
    }

    protocolData.totalAssetDeposited += getTokenBalances.totalBalanceUsd;
    protocolData.totalValueLocked += protocolData.totalAssetDeposited - (protocolData.totalBorrowed as number);
    (protocolData.totalSupplied as number) += getTokenBalances.totalBalanceUsd;

    const v1Logs = await this.services.blockchain.evm.getContractLogs({
      chain: eulerConfig.v1Config.chain,
      address: eulerConfig.v1Config.protocolProxy,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    const events: Array<any> = v1Logs
      .filter((log) => Object.values(EulerV1Events).includes(log.topics[0]))
      .map((log) =>
        decodeEventLog({
          abi: EulerMarketsAbi,
          topics: log.topics,
          data: log.data,
        }),
      );
    for (const event of events) {
      const underlying = normalizeAddress(event.args.underlying);
      const token = getTokenBalances.tokenBalanceUsds[underlying]
        ? getTokenBalances.tokenBalanceUsds[underlying].token
        : null;
      if (token) {
        const tokenPriceUsd = getTokenBalances.tokenBalanceUsds[underlying].priceUsd;

        // the same as dTokens, all eTokens have 18 decimals
        const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * tokenPriceUsd;

        switch (event.eventName) {
          case 'Deposit': {
            (protocolData.volumes.deposit as number) += amountUsd;

            if (protocolData.breakdown[token.chain][token.address]) {
              (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
            }
            break;
          }
          case 'Withdraw': {
            (protocolData.volumes.withdraw as number) += amountUsd;

            if (protocolData.breakdown[token.chain][token.address]) {
              (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += amountUsd;
            }
            break;
          }
          case 'Borrow': {
            (protocolData.volumes.borrow as number) += amountUsd;

            if (protocolData.breakdown[token.chain][token.address]) {
              (protocolData.breakdown[token.chain][token.address].volumes.borrow as number) += amountUsd;
            }
            break;
          }
          case 'Repay': {
            (protocolData.volumes.repay as number) += amountUsd;

            if (protocolData.breakdown[token.chain][token.address]) {
              (protocolData.breakdown[token.chain][token.address].volumes.repay as number) += amountUsd;
            }
            break;
          }
          case 'Liquidation': {
            (protocolData.volumes.liquidation as number) += amountUsd;

            const collateral = normalizeAddress(event.args.collateral);
            const collateralToken = getTokenBalances.tokenBalanceUsds[collateral]
              ? getTokenBalances.tokenBalanceUsds[underlying].token
              : null;
            if (collateralToken) {
              if (protocolData.breakdown[collateralToken.chain][collateralToken.address]) {
                (protocolData.breakdown[collateralToken.chain][collateralToken.address].volumes
                  .liquidation as number) += amountUsd;
              }
            }
            break;
          }
        }
      }
    }

    // get vaults data - euler v2
    for (const factoryConfig of eulerConfig.factories) {
      if (factoryConfig.birthday > options.timestamp) {
        continue;
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.endTime,
      );

      if (!protocolData.breakdown[factoryConfig.chain]) {
        protocolData.breakdown[factoryConfig.chain] = {};
      }

      // const proxyListLength = await this.services.blockchain.evm.readContract({
      //   chain: factoryConfig.chain,
      //   abi: GenericFactoryAbi,
      //   target: factoryConfig.factory,
      //   method: 'getProxyListLength',
      //   params: [],
      //   blockNumber: blockNumber,
      // });

      // const proxyListCalls: Array<ContractCall> = [];
      // for (let i = 0; i < Number(proxyListLength); i++) {
      //   proxyListCalls.push({
      //     abi: GenericFactoryAbi,
      //     target: factoryConfig.factory,
      //     method: 'proxyList',
      //     params: [i],
      //   })
      // }
      // const proxyList: Array<string> = await this.services.blockchain.evm.multicall({
      //   chain: factoryConfig.chain,
      //   blockNumber: blockNumber,
      //   calls: proxyListCalls,
      // });

      for (const vault of factoryConfig.vaults) {
        const [asset, totalAssets, totalBorrows, interestRate, protocolFeeShare] =
          await this.services.blockchain.evm.multicall({
            chain: factoryConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: EVaultAbi,
                target: vault,
                method: 'asset',
                params: [],
              },
              {
                abi: EVaultAbi,
                target: vault,
                method: 'totalAssets',
                params: [],
              },
              {
                abi: EVaultAbi,
                target: vault,
                method: 'totalBorrows',
                params: [],
              },
              {
                abi: EVaultAbi,
                target: vault,
                method: 'interestRate',
                params: [],
              },
              {
                abi: EVaultAbi,
                target: vault,
                method: 'protocolFeeShare',
                params: [],
              },
            ],
          });

        if (asset) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: factoryConfig.chain,
            address: asset,
          });
          if (token) {
            if (!protocolData.breakdown[factoryConfig.chain][token.address]) {
              protocolData.breakdown[factoryConfig.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                totalSupplied: 0,
                totalBorrowed: 0,
                volumes: {
                  deposit: 0,
                  withdraw: 0,
                  borrow: 0,
                  repay: 0,
                  liquidation: 0,
                },
              };
            }

            const tokenPriceUsd = FixedRate[token.address]
              ? FixedRate[token.address]
              : await this.services.oracle.getTokenPriceUsdRounded({
                  chain: factoryConfig.chain,
                  address: asset,
                  timestamp: options.timestamp,
                });

            const totalDepositUsd = formatBigNumberToNumber(totalAssets.toString(), token.decimals) * tokenPriceUsd;
            const totalBorrowUsd = formatBigNumberToNumber(totalBorrows.toString(), token.decimals) * tokenPriceUsd;

            const borrowRate =
              formatBigNumberToNumber(interestRate.toString(), SolidityUnits.RayDecimals) * TimeUnits.SecondsPerYear;

            // https://etherscan.io/address/0x8ff1c814719096b61abf00bb46ead0c9a529dd7d#code#F10#L26
            const protocolFeeRate = formatBigNumberToNumber(protocolFeeShare.toString(), 4);

            const borrowFees = (borrowRate * totalBorrowUsd) / TimeUnits.DaysPerYear;
            const protocolRevenue = borrowFees * protocolFeeRate;
            const supplySideRevenue = borrowFees - protocolRevenue;

            protocolData.totalAssetDeposited += totalDepositUsd;
            protocolData.totalValueLocked += totalDepositUsd - totalBorrowUsd;
            (protocolData.totalSupplied as number) += totalDepositUsd;
            (protocolData.totalBorrowed as number) += totalBorrowUsd;
            protocolData.totalFees += borrowFees;
            protocolData.supplySideRevenue += supplySideRevenue;
            protocolData.protocolRevenue += protocolRevenue;

            protocolData.breakdown[factoryConfig.chain][token.address].totalAssetDeposited += totalDepositUsd;
            protocolData.breakdown[factoryConfig.chain][token.address].totalValueLocked +=
              totalDepositUsd - totalBorrowUsd;
            (protocolData.breakdown[factoryConfig.chain][token.address].totalSupplied as number) += totalDepositUsd;
            (protocolData.breakdown[factoryConfig.chain][token.address].totalBorrowed as number) += totalBorrowUsd;
            protocolData.breakdown[factoryConfig.chain][token.address].totalFees += borrowFees;
            protocolData.breakdown[factoryConfig.chain][token.address].supplySideRevenue += supplySideRevenue;
            protocolData.breakdown[factoryConfig.chain][token.address].protocolRevenue += protocolRevenue;

            if (containVault(factoryConfig.vaults, vault)) {
              // process vault events
              const vaultLogs = await this.services.blockchain.evm.getContractLogs({
                chain: factoryConfig.chain,
                address: vault,
                fromBlock: beginBlock,
                toBlock: endBlock,
              });
              for (const log of vaultLogs) {
                const signature = log.topics[0];
                if (Object.values(EulerEvents).includes(signature)) {
                  const event: any = decodeEventLog({
                    abi: EVaultAbi,
                    topics: log.topics,
                    data: log.data,
                  });

                  if (signature === EulerEvents.Liquidate) {
                    const repayAmountUsd =
                      formatBigNumberToNumber(event.args.repayAssets.toString(), token.decimals) * tokenPriceUsd;

                    (protocolData.volumes.repay as number) += repayAmountUsd;
                    (protocolData.breakdown[factoryConfig.chain][token.address].volumes.repay as number) +=
                      repayAmountUsd;

                    // liquidator will reveive collateral vault token
                    const collateralAddress = await this.services.blockchain.evm.readContract({
                      chain: factoryConfig.chain,
                      abi: EVaultAbi,
                      target: event.args.collateral,
                      method: 'asset',
                      params: [],
                    });
                    const collateralToken = await this.services.blockchain.evm.getTokenInfo({
                      chain: factoryConfig.chain,
                      address: collateralAddress,
                    });
                    if (collateralToken) {
                      const collateralPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                        chain: factoryConfig.chain,
                        address: collateralToken.address,
                        timestamp: options.timestamp,
                      });
                      const collateralAmount = await this.services.blockchain.evm.readContract({
                        chain: factoryConfig.chain,
                        abi: EVaultAbi,
                        target: event.args.collateral,
                        method: 'convertToAssets',
                        params: [event.args.yieldBalance.toString()],
                      });
                      const collateralAmountUsd =
                        formatBigNumberToNumber(collateralAmount.toString(), collateralToken.decimals) *
                        collateralPriceUsd;

                      (protocolData.volumes.liquidation as number) += collateralAmountUsd;
                      (protocolData.breakdown[factoryConfig.chain][token.address].volumes.liquidation as number) +=
                        collateralAmountUsd;
                    }
                  } else {
                    const amountUsd =
                      formatBigNumberToNumber(event.args.assets.toString(), token.decimals) * tokenPriceUsd;
                    switch (signature) {
                      case EulerEvents.Deposit: {
                        (protocolData.volumes.deposit as number) += amountUsd;
                        (protocolData.breakdown[factoryConfig.chain][token.address].volumes.deposit as number) +=
                          amountUsd;
                        break;
                      }
                      case EulerEvents.Withdraw: {
                        (protocolData.volumes.withdraw as number) += amountUsd;
                        (protocolData.breakdown[factoryConfig.chain][token.address].volumes.withdraw as number) +=
                          amountUsd;
                        break;
                      }
                      case EulerEvents.Borrow: {
                        (protocolData.volumes.borrow as number) += amountUsd;
                        (protocolData.breakdown[factoryConfig.chain][token.address].volumes.borrow as number) +=
                          amountUsd;
                        break;
                      }
                      case EulerEvents.Repay: {
                        (protocolData.volumes.repay as number) += amountUsd;
                        (protocolData.breakdown[factoryConfig.chain][token.address].volumes.repay as number) +=
                          amountUsd;
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
