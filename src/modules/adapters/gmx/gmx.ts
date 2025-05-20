import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { GmxProtocolConfig } from '../../../configs/protocols/gmx';
import GmxVaultV1Abi from '../../../configs/abi/gmx/Vault.json';
import { ContractCall } from '../../../services/blockchains/domains';
import { decodeEventLog } from 'viem';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import EventEmitterAbi from '../../../configs/abi/gmx/EventEmitter.json';
import GmxUtils from './utils';
import ProtocolAdapter from '../protocol';

const Events = {
  // add/remove liquidity
  BuyUSDG: '0xab4c77c74cd32c85f35416cf03e7ce9e2d4387f7b7f2c1f4bf53daaecf8ea72d',
  SellUSDG: '0xd732b7828fa6cee72c285eac756fc66a7477e3dc22e22e7c432f1c265d40b483',

  // swap
  Swap: '0x0874b2d545cb271cdbda4e093020c452328b24af12382ed62c4d00f5c26709db',
  CollectSwapFees: '0x47cd9dda0e50ce30bcaaacd0488452b596221c07ac402a581cfae4d3933cac2b',

  // margin
  IncreasePosition: '0x2fe68525253654c21998f35787a8d0f361905ef647c854092430ab65f2f15022',
  DecreasePosition: '0x93d75d64d1f84fc6f430a64fc578bdd4c1e090e90ea2d51773e626d19de56d30',
  CollectMarginFees: '0x5d0c0019d3d45fadeb74eff9d2c9924d146d000ac6bcf3c28bf0ac3c9baa011a',

  // liquidate
  LiquidatePosition: '0x2e1f85a64a2f22cf2f0c42584e7c919ed4abe8d53675cff0f62bf1e95a1c676f',

  // v2 - EventEmitter
  Event1: '0x137a44067c8961cd7e1d876f4754a5a3a75989b4552f1843fc69c3b372def160',
};

export default class GmxAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.gmx';

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
      volumes: {
        deposit: 0,
        withdraw: 0,
        swap: 0,
      },
      volumePerpetual: {
        perpetualOpenLong: 0,
        perpetualOpenShort: 0,
        perpetualCloseLong: 0,
        perpetualCloseShort: 0,
        perpetualLiquidateLong: 0,
        perpetualLiquidateShort: 0,
        perpetualCollateralLiquidateLong: 0,
        perpetualCollateralLiquidateShort: 0,
      },
    };

    const gmxConfig = this.protocolConfig as GmxProtocolConfig;

    //
    // gmx v1
    //
    for (const vaultConfig of gmxConfig.v1Vaults) {
      if (vaultConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[vaultConfig.chain]) {
        protocolData.breakdown[vaultConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        vaultConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        vaultConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        vaultConfig.chain,
        options.endTime,
      );

      const allWhitelistedTokensLength = await this.services.blockchain.evm.readContract({
        chain: vaultConfig.chain,
        abi: GmxVaultV1Abi,
        target: vaultConfig.vault,
        method: 'allWhitelistedTokensLength',
        params: [],
        blockNumber: blockNumber,
      });

      const calls: Array<ContractCall> = [];
      for (let i = 0; i < Number(allWhitelistedTokensLength); i++) {
        calls.push({
          abi: GmxVaultV1Abi,
          method: 'allWhitelistedTokens',
          target: vaultConfig.vault,
          params: [i],
        });
      }

      const getTokensResults = await this.services.blockchain.evm.multicall({
        chain: vaultConfig.chain,
        blockNumber: blockNumber,
        calls: calls,
      });

      const tokens: Array<Token> = [];
      for (const address of getTokensResults) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: vaultConfig.chain,
          address: address,
        });
        if (token) {
          tokens.push(token);
        }
      }

      const getBalanceResults = await this.getAddressBalanceUsd({
        chain: vaultConfig.chain,
        ownerAddress: vaultConfig.vault,
        tokens: tokens,
        blockNumber: blockNumber,
        timestamp: options.timestamp,
      });

      protocolData.totalAssetDeposited += getBalanceResults.totalBalanceUsd;
      protocolData.totalValueLocked += getBalanceResults.totalBalanceUsd;
      (protocolData.totalSupplied as number) += getBalanceResults.totalBalanceUsd;

      for (const [address, balance] of Object.entries(getBalanceResults.tokenBalanceUsds)) {
        if (!protocolData.breakdown[vaultConfig.chain][address]) {
          protocolData.breakdown[vaultConfig.chain][address] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              swap: 0,
            },
            volumePerpetual: {
              perpetualOpenLong: 0,
              perpetualOpenShort: 0,
              perpetualCloseLong: 0,
              perpetualCloseShort: 0,
              perpetualLiquidateLong: 0,
              perpetualLiquidateShort: 0,
              perpetualCollateralLiquidateLong: 0,
              perpetualCollateralLiquidateShort: 0,
            },
          };
        }

        protocolData.breakdown[vaultConfig.chain][address].totalAssetDeposited += balance.balanceUsd;
        protocolData.breakdown[vaultConfig.chain][address].totalValueLocked += balance.balanceUsd;
        (protocolData.breakdown[vaultConfig.chain][address].totalSupplied as number) += balance.balanceUsd;
      }

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: vaultConfig.chain,
        address: vaultConfig.vault,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        const signature = log.topics[0];

        if (Object.values(Events).includes(signature)) {
          const event: any = decodeEventLog({
            abi: GmxVaultV1Abi,
            topics: log.topics,
            data: log.data,
          });

          switch (signature) {
            case Events.BuyUSDG:
            case Events.SellUSDG: {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: vaultConfig.chain,
                address: event.args.token,
              });
              if (token) {
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                });

                const amountUsd =
                  formatBigNumberToNumber(event.args.tokenAmount.toString(), token.decimals) * tokenPriceUsd;

                if (signature === Events.BuyUSDG) {
                  (protocolData.volumes.deposit as number) += amountUsd;
                  (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;

                  // fees
                  const feeUsd = formatBigNumberToNumber(event.args.feeBasisPoints, 4) * amountUsd;
                  const supplySideRevenue = feeUsd * 0.7;
                  const protocolRevenue = feeUsd - supplySideRevenue;

                  protocolData.totalFees += feeUsd;
                  protocolData.supplySideRevenue += supplySideRevenue;
                  protocolData.protocolRevenue += protocolRevenue;
                  protocolData.breakdown[token.chain][token.address].totalFees += feeUsd;
                  protocolData.breakdown[token.chain][token.address].supplySideRevenue += supplySideRevenue;
                  protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolRevenue;
                } else {
                  (protocolData.volumes.withdraw as number) += amountUsd;
                  (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += amountUsd;
                }
              }

              break;
            }
            case Events.Swap: {
              const tokenIn = await this.services.blockchain.evm.getTokenInfo({
                chain: vaultConfig.chain,
                address: event.args.tokenIn,
              });
              if (tokenIn) {
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: tokenIn.chain,
                  address: tokenIn.address,
                  timestamp: options.timestamp,
                });

                const amountUsd =
                  formatBigNumberToNumber(event.args.amountIn.toString(), tokenIn.decimals) * tokenPriceUsd;

                (protocolData.volumes.swap as number) += amountUsd;
              }

              break;
            }
            case Events.IncreasePosition:
            case Events.DecreasePosition: {
              // count index token as open interest volumes
              const indexToken = normalizeAddress(event.args.indexToken);

              // count deposit volume on collateral token
              const collateralToken = normalizeAddress(event.args.collateralToken);

              // 30 decimals
              // https://arbiscan.io/address/0x489ee077994B6658eAfA855C308275EAd8097C4A#code#L758
              const indexAmountUsd = formatBigNumberToNumber(event.args.sizeDelta.toString(), 30);
              const collateralAmountUsd = formatBigNumberToNumber(event.args.collateralDelta.toString(), 30);

              // long or short position
              const isLong = Boolean(event.args.isLong);

              if (signature === Events.IncreasePosition) {
                // count collateral volumes
                (protocolData.volumes.deposit as number) += collateralAmountUsd;
                (protocolData.breakdown[vaultConfig.chain][collateralToken].volumes.deposit as number) +=
                  collateralAmountUsd;

                // count perpetual volumes
                if (isLong) {
                  ((protocolData.volumePerpetual as any).perpetualOpenLong as number) += indexAmountUsd;
                  ((protocolData.breakdown[vaultConfig.chain][indexToken].volumePerpetual as any)
                    .perpetualOpenLong as number) += indexAmountUsd;
                } else {
                  ((protocolData.volumePerpetual as any).perpetualOpenShort as number) += indexAmountUsd;
                  ((protocolData.breakdown[vaultConfig.chain][indexToken].volumePerpetual as any)
                    .perpetualOpenShort as number) += indexAmountUsd;
                }
              } else {
                // count collateral volumes
                (protocolData.volumes.withdraw as number) += collateralAmountUsd;
                (protocolData.breakdown[vaultConfig.chain][collateralToken].volumes.withdraw as number) +=
                  collateralAmountUsd;

                if (isLong) {
                  ((protocolData.volumePerpetual as any).perpetualCloseLong as number) += indexAmountUsd;
                  ((protocolData.breakdown[vaultConfig.chain][indexToken].volumePerpetual as any)
                    .perpetualCloseLong as number) += indexAmountUsd;
                } else {
                  ((protocolData.volumePerpetual as any).perpetualCloseShort as number) += indexAmountUsd;
                  ((protocolData.breakdown[vaultConfig.chain][indexToken].volumePerpetual as any)
                    .perpetualCloseShort as number) += indexAmountUsd;
                }
              }

              break;
            }
            case Events.LiquidatePosition: {
              const indexToken = normalizeAddress(event.args.indexToken);
              const collateralToken = normalizeAddress(event.args.collateralToken);

              const sizeAmountUsd = formatBigNumberToNumber(event.args.size.toString(), 30);
              const collateralAmountUsd = formatBigNumberToNumber(event.args.collateral.toString(), 30);

              const isLong = Boolean(event.args.isLong);

              if (isLong) {
                (protocolData.volumePerpetual as any).perpetualLiquidateLong += sizeAmountUsd;
                (protocolData.volumePerpetual as any).perpetualCollateralLiquidateLong += collateralAmountUsd;
                (protocolData.breakdown[vaultConfig.chain][indexToken].volumePerpetual as any).perpetualLiquidateLong +=
                  sizeAmountUsd;
                (
                  protocolData.breakdown[vaultConfig.chain][collateralToken].volumePerpetual as any
                ).perpetualCollateralLiquidateLong += sizeAmountUsd;
              } else {
                (protocolData.volumePerpetual as any).perpetualLiquidateShort += sizeAmountUsd;
                (protocolData.volumePerpetual as any).perpetualCollateralLiquidateShort += collateralAmountUsd;
                (
                  protocolData.breakdown[vaultConfig.chain][indexToken].volumePerpetual as any
                ).perpetualLiquidateShort += sizeAmountUsd;
                (
                  protocolData.breakdown[vaultConfig.chain][collateralToken].volumePerpetual as any
                ).perpetualCollateralLiquidateShort += sizeAmountUsd;
              }

              break;
            }
            case Events.CollectSwapFees:
            case Events.CollectMarginFees: {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: vaultConfig.chain,
                address: event.args.token,
              });

              if (token) {
                const feeUsd = formatBigNumberToNumber(event.args.feeUsd.toString(), 30);
                const supplySideRevenue = feeUsd * 0.7;
                const protocolRevenue = feeUsd - supplySideRevenue;

                if (!protocolData.breakdown[token.chain][token.address]) {
                  protocolData.breakdown[token.chain][token.address] = {
                    ...getInitialProtocolCoreMetrics(),
                    totalSupplied: 0,
                    volumes: {
                      deposit: 0,
                      withdraw: 0,
                      swap: 0,
                    },
                    volumePerpetual: {
                      perpetualOpenLong: 0,
                      perpetualOpenShort: 0,
                      perpetualCloseLong: 0,
                      perpetualCloseShort: 0,
                      perpetualLiquidateLong: 0,
                      perpetualLiquidateShort: 0,
                      perpetualCollateralLiquidateLong: 0,
                      perpetualCollateralLiquidateShort: 0,
                    },
                  };
                }

                protocolData.totalFees += feeUsd;
                protocolData.supplySideRevenue += supplySideRevenue;
                protocolData.protocolRevenue += protocolRevenue;
                protocolData.breakdown[token.chain][token.address].totalFees += feeUsd;
                protocolData.breakdown[token.chain][token.address].supplySideRevenue += supplySideRevenue;
                protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolRevenue;
              }

              break;
            }
          }
        }
      }
    }

    //
    // gmx v2
    //
    for (const vaultConfig of gmxConfig.v2Vaults) {
      if (vaultConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[vaultConfig.chain]) {
        protocolData.breakdown[vaultConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        vaultConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        vaultConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        vaultConfig.chain,
        options.endTime,
      );

      const calls: Array<ContractCall> = [];
      for (const marketConfig of vaultConfig.markets) {
        calls.push({
          abi: Erc20Abi,
          target: marketConfig.longToken,
          method: 'balanceOf',
          params: [marketConfig.marketToken],
        });
        calls.push({
          abi: Erc20Abi,
          target: marketConfig.shortToken,
          method: 'balanceOf',
          params: [marketConfig.marketToken],
        });
      }

      const getBalanceResults = await this.services.blockchain.evm.multicall({
        chain: vaultConfig.chain,
        blockNumber: blockNumber,
        calls: calls,
      });

      for (let i = 0; i < vaultConfig.markets.length; i++) {
        const [longToken, shortToken] = await Promise.all([
          this.services.blockchain.evm.getTokenInfo({
            chain: vaultConfig.chain,
            address: vaultConfig.markets[i].longToken,
          }),
          this.services.blockchain.evm.getTokenInfo({
            chain: vaultConfig.chain,
            address: vaultConfig.markets[i].shortToken,
          }),
        ]);

        if (longToken && shortToken) {
          const indexToken = normalizeAddress(vaultConfig.markets[i].indexToken);
          if (!protocolData.breakdown[vaultConfig.chain][indexToken]) {
            protocolData.breakdown[vaultConfig.chain][indexToken] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
              volumes: {
                deposit: 0,
                withdraw: 0,
                swap: 0,
              },
              volumePerpetual: {
                perpetualOpenLong: 0,
                perpetualOpenShort: 0,
                perpetualCloseLong: 0,
                perpetualCloseShort: 0,
                perpetualLiquidateLong: 0,
                perpetualLiquidateShort: 0,
                perpetualCollateralLiquidateLong: 0,
                perpetualCollateralLiquidateShort: 0,
              },
            };
          }
          if (!protocolData.breakdown[longToken.chain][longToken.address]) {
            protocolData.breakdown[longToken.chain][longToken.address] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
              volumes: {
                deposit: 0,
                withdraw: 0,
                swap: 0,
              },
              volumePerpetual: {
                perpetualOpenLong: 0,
                perpetualOpenShort: 0,
                perpetualCloseLong: 0,
                perpetualCloseShort: 0,
                perpetualLiquidateLong: 0,
                perpetualLiquidateShort: 0,
                perpetualCollateralLiquidateLong: 0,
                perpetualCollateralLiquidateShort: 0,
              },
            };
          }
          if (!protocolData.breakdown[shortToken.chain][shortToken.address]) {
            protocolData.breakdown[shortToken.chain][shortToken.address] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
              volumes: {
                deposit: 0,
                withdraw: 0,
                swap: 0,
              },
              volumePerpetual: {
                perpetualOpenLong: 0,
                perpetualOpenShort: 0,
                perpetualCloseLong: 0,
                perpetualCloseShort: 0,
                perpetualLiquidateLong: 0,
                perpetualLiquidateShort: 0,
                perpetualCollateralLiquidateLong: 0,
                perpetualCollateralLiquidateShort: 0,
              },
            };
          }

          const [longTokenPriceUsd, shortTokenPriceUsd] = await Promise.all([
            this.services.oracle.getTokenPriceUsdRounded({
              chain: vaultConfig.chain,
              address: vaultConfig.markets[i].longToken,
              timestamp: options.timestamp,
            }),
            this.services.oracle.getTokenPriceUsdRounded({
              chain: vaultConfig.chain,
              address: vaultConfig.markets[i].shortToken,
              timestamp: options.timestamp,
            }),
          ]);

          const longTokenBalanceUsd =
            formatBigNumberToNumber(
              getBalanceResults[i * 2] ? getBalanceResults[i * 2].toString() : '0',
              longToken.decimals,
            ) * longTokenPriceUsd;
          const shortTokenBalanceUsd =
            formatBigNumberToNumber(
              getBalanceResults[i * 2 + 1] ? getBalanceResults[i * 2 + 1].toString() : '0',
              shortToken.decimals,
            ) * shortTokenPriceUsd;

          let balanceUsd = longTokenBalanceUsd;
          if (!compareAddress(longToken.address, shortToken.address)) {
            balanceUsd += shortTokenBalanceUsd;
          }

          protocolData.totalAssetDeposited += balanceUsd;
          protocolData.totalValueLocked += balanceUsd;
          (protocolData.totalSupplied as number) += balanceUsd;

          // add longToken balance
          protocolData.breakdown[longToken.chain][longToken.address].totalAssetDeposited += longTokenBalanceUsd;
          protocolData.breakdown[longToken.chain][longToken.address].totalValueLocked += longTokenBalanceUsd;
          (protocolData.breakdown[longToken.chain][longToken.address].totalSupplied as number) += longTokenBalanceUsd;

          // add shortToken balance
          protocolData.breakdown[shortToken.chain][shortToken.address].totalAssetDeposited += shortTokenBalanceUsd;
          protocolData.breakdown[shortToken.chain][shortToken.address].totalValueLocked += shortTokenBalanceUsd;
          (protocolData.breakdown[shortToken.chain][shortToken.address].totalSupplied as number) +=
            shortTokenBalanceUsd;
        }
      }

      // large log size, need to recuce block range
      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: vaultConfig.chain,
        address: vaultConfig.eventEmitter,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        if (log.topics[0] === Events.Event1) {
          const event: any = decodeEventLog({
            abi: EventEmitterAbi,
            topics: log.topics,
            data: log.data,
          });

          const eventData: any = event.args.eventData as any;
          switch (event.args.eventName) {
            case 'DepositCreated': {
              const params = GmxUtils.decodeParamsEvent1_DepositCreated(eventData);

              const [longToken, shortToken] = await Promise.all([
                this.services.blockchain.evm.getTokenInfo({
                  chain: vaultConfig.chain,
                  address: params.longToken,
                }),
                this.services.blockchain.evm.getTokenInfo({
                  chain: vaultConfig.chain,
                  address: params.shortToken,
                }),
              ]);
              if (longToken && shortToken) {
                const [longTokenPriceUsd, shortTokenPriceUsd] = await Promise.all([
                  this.services.oracle.getTokenPriceUsdRounded({
                    chain: longToken.chain,
                    address: longToken.address,
                    timestamp: options.timestamp,
                  }),
                  this.services.oracle.getTokenPriceUsdRounded({
                    chain: shortToken.chain,
                    address: shortToken.address,
                    timestamp: options.timestamp,
                  }),
                ]);

                const longTokenAmountUsd =
                  formatBigNumberToNumber(params.longTokenAmount.toString(), longToken.decimals) * longTokenPriceUsd;
                const shortTokenAmountUsd =
                  formatBigNumberToNumber(params.shortTokenAmount.toString(), shortToken.decimals) * shortTokenPriceUsd;

                (protocolData.volumes.deposit as number) += longTokenAmountUsd + shortTokenAmountUsd;
                (protocolData.breakdown[longToken.chain][longToken.address].volumes.deposit as number) +=
                  longTokenAmountUsd;
                (protocolData.breakdown[shortToken.chain][shortToken.address].volumes.deposit as number) +=
                  shortTokenAmountUsd;
              }

              break;
            }
            case 'WithdrawalCreated': {
              const params = GmxUtils.decodeParamsEvent1_WithdrawalCreated(eventData);

              const market = vaultConfig.markets.filter((item) => compareAddress(item.marketToken, params.market))[0];

              if (market) {
                const [longToken, shortToken] = await Promise.all([
                  this.services.blockchain.evm.getTokenInfo({
                    chain: vaultConfig.chain,
                    address: market.longToken,
                  }),
                  this.services.blockchain.evm.getTokenInfo({
                    chain: vaultConfig.chain,
                    address: market.shortToken,
                  }),
                ]);

                if (longToken && shortToken) {
                  const [longTokenPriceUsd, shortTokenPriceUsd] = await Promise.all([
                    this.services.oracle.getTokenPriceUsdRounded({
                      chain: longToken.chain,
                      address: longToken.address,
                      timestamp: options.timestamp,
                    }),
                    this.services.oracle.getTokenPriceUsdRounded({
                      chain: shortToken.chain,
                      address: shortToken.address,
                      timestamp: options.timestamp,
                    }),
                  ]);

                  const longTokenAmountUsd =
                    formatBigNumberToNumber(params.minLongTokenAmount.toString(), longToken.decimals) *
                    longTokenPriceUsd;
                  const shortTokenAmountUsd =
                    formatBigNumberToNumber(params.minShortTokenAmount.toString(), shortToken.decimals) *
                    shortTokenPriceUsd;

                  (protocolData.volumes.withdraw as number) += longTokenAmountUsd + shortTokenAmountUsd;
                  (protocolData.breakdown[longToken.chain][longToken.address].volumes.withdraw as number) +=
                    longTokenAmountUsd;
                  (protocolData.breakdown[shortToken.chain][shortToken.address].volumes.withdraw as number) +=
                    shortTokenAmountUsd;
                }
              }

              break;
            }
            case 'SwapInfo': {
              const params = GmxUtils.decodeParamsEvent1_SwapInfo(eventData);

              const tokenIn = await this.services.blockchain.evm.getTokenInfo({
                chain: vaultConfig.chain,
                address: params.tokenIn,
              });
              if (tokenIn) {
                const tokenInPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: tokenIn.chain,
                  address: tokenIn.address,
                  timestamp: options.timestamp,
                });
                const amountUsd = formatBigNumberToNumber(params.amountIn, tokenIn.decimals) * tokenInPriceUsd;

                (protocolData.volumes.swap as number) += amountUsd;
              }

              break;
            }
            case 'SwapFeesCollected': {
              const params = GmxUtils.decodeParamsEvent1_SwapFeesCollected(eventData);

              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: vaultConfig.chain,
                address: params.token.value,
              });
              if (token) {
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                });

                const feeReceiverAmount =
                  formatBigNumberToNumber(params.feeReceiverAmount, token.decimals) ** tokenPriceUsd;
                const feeAmountForPool =
                  formatBigNumberToNumber(params.feeAmountForPool, token.decimals) ** tokenPriceUsd;
                const uiFeeAmount = formatBigNumberToNumber(params.uiFeeAmount, token.decimals) ** tokenPriceUsd;

                // count total fees
                const totalFeeUsd = feeReceiverAmount + feeAmountForPool + uiFeeAmount;

                // 37% -> protocol
                const protocolRevenue = totalFeeUsd * 0.37;
                const supplySideRevenue = totalFeeUsd - protocolRevenue;

                protocolData.totalFees += totalFeeUsd;
                protocolData.supplySideRevenue += supplySideRevenue;
                protocolData.protocolRevenue += protocolRevenue;

                if (!protocolData.breakdown[token.chain][token.address]) {
                  process.exit(0);
                }

                protocolData.breakdown[vaultConfig.chain][token.address].totalFees += totalFeeUsd;
                protocolData.breakdown[vaultConfig.chain][token.address].supplySideRevenue += supplySideRevenue;
                protocolData.breakdown[vaultConfig.chain][token.address].protocolRevenue += protocolRevenue;
              }

              break;
            }
            case 'PositionFeesCollected': {
              const params = GmxUtils.decodeParamsEvent1_PositionFeesCollected(eventData);

              const collateralAddress = normalizeAddress(params.collateralToken);

              // 30 decimals
              const feeTotalUsd = formatBigNumberToNumber(params.borrowingFeeUsd.toString(), 30);

              // 37% -> protocol
              const protocolRevenue = feeTotalUsd * 0.37;
              const supplySideRevenue = feeTotalUsd - protocolRevenue;

              protocolData.totalFees += feeTotalUsd;
              protocolData.supplySideRevenue += supplySideRevenue;
              protocolData.protocolRevenue += protocolRevenue;

              if (!protocolData.breakdown[vaultConfig.chain][collateralAddress]) {
                process.exit(0);
              }

              protocolData.breakdown[vaultConfig.chain][collateralAddress].totalFees += feeTotalUsd;
              protocolData.breakdown[vaultConfig.chain][collateralAddress].supplySideRevenue += supplySideRevenue;
              protocolData.breakdown[vaultConfig.chain][collateralAddress].protocolRevenue += protocolRevenue;

              break;
            }
            case 'PositionIncrease':
            case 'PositionDecrease': {
              const params = GmxUtils.decodeParamsEvent1_PositionChange(eventData);

              const market = vaultConfig.markets.filter((item) => compareAddress(item.marketToken, params.market))[0];
              const collateralToken = await this.services.blockchain.evm.getTokenInfo({
                chain: vaultConfig.chain,
                address: params.collateralToken,
              });

              if (market && collateralToken) {
                const collateralPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: collateralToken.chain,
                  address: collateralToken.address,
                  timestamp: options.timestamp,
                });

                const indexToken = normalizeAddress(market.indexToken);
                const sizeDeltaUsd = formatBigNumberToNumber(params.sizeDeltaUsd.toString(), 30); // 30 decimals
                const collateralAmountUsd =
                  formatBigNumberToNumber(params.collateralDeltaAmount.toString(), collateralToken.decimals) *
                  collateralPriceUsd;

                if (event.args.eventName === 'PositionIncrease') {
                  // open interest volume
                  if (params.isLong) {
                    (protocolData.volumePerpetual as any).perpetualOpenLong += sizeDeltaUsd;
                    (protocolData.breakdown[vaultConfig.chain][indexToken].volumePerpetual as any).perpetualOpenLong +=
                      sizeDeltaUsd;
                  } else {
                    (protocolData.volumePerpetual as any).perpetualOpenShort += sizeDeltaUsd;
                    (protocolData.breakdown[vaultConfig.chain][indexToken].volumePerpetual as any).perpetualOpenShort +=
                      sizeDeltaUsd;
                  }

                  // collateral volume
                  (protocolData.volumes.deposit as number) += collateralAmountUsd;
                  (protocolData.breakdown[collateralToken.chain][collateralToken.address].volumes.deposit as number) +=
                    collateralAmountUsd;
                } else {
                  if (params.isLong) {
                    (protocolData.volumePerpetual as any).perpetualCloseLong += sizeDeltaUsd;
                    (protocolData.breakdown[vaultConfig.chain][indexToken].volumePerpetual as any).perpetualCloseLong +=
                      sizeDeltaUsd;
                  } else {
                    (protocolData.volumePerpetual as any).perpetualCloseShort += sizeDeltaUsd;
                    (
                      protocolData.breakdown[vaultConfig.chain][indexToken].volumePerpetual as any
                    ).perpetualCloseShort += sizeDeltaUsd;
                  }

                  // collateral volume
                  (protocolData.volumes.withdraw as number) += collateralAmountUsd;
                  (protocolData.breakdown[collateralToken.chain][collateralToken.address].volumes.withdraw as number) +=
                    collateralAmountUsd;
                }
              }

              break;
            }
            case 'OrderCreated': {
              const params = GmxUtils.decodeParamsEvent1_OrderCreated(eventData);

              const market = vaultConfig.markets.filter((item) => compareAddress(item.marketToken, params.market))[0];

              // liquidation
              // https://github.com/gmx-io/gmx-synthetics/blob/main/contracts/order/Order.sol#L12
              if (market && params.orderType === 7) {
                let positionSizeUsd = formatBigNumberToNumber(params.sizeDeltaUsd, 30);

                const indexToken = normalizeAddress(market.indexToken);
                const collateralToken = await this.services.blockchain.evm.getTokenInfo({
                  chain: vaultConfig.chain,
                  address: params.initialCollateralToken,
                });
                if (collateralToken) {
                  const collateralPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                    chain: collateralToken.chain,
                    address: collateralToken.address,
                    timestamp: options.timestamp,
                  });

                  const collateralAmountUsd =
                    formatBigNumberToNumber(params.initialCollateralDeltaAmount, collateralToken.decimals) *
                    collateralPriceUsd;

                  // count collateral volumes
                  if (params.isLong) {
                    (protocolData.volumePerpetual as any).perpetualCollateralLiquidateLong += collateralAmountUsd;
                    (
                      protocolData.breakdown[collateralToken.chain][collateralToken.address].volumePerpetual as any
                    ).perpetualCollateralLiquidateLong += collateralAmountUsd;
                  } else {
                    (protocolData.volumePerpetual as any).perpetualCollateralLiquidateShort += collateralAmountUsd;
                    (
                      protocolData.breakdown[collateralToken.chain][collateralToken.address].volumePerpetual as any
                    ).perpetualCollateralLiquidateShort += collateralAmountUsd;
                  }
                }

                // update liquidate position size
                if (params.isLong) {
                  (protocolData.volumePerpetual as any).perpetualLiquidateLong += positionSizeUsd;
                  (
                    protocolData.breakdown[vaultConfig.chain][indexToken].volumePerpetual as any
                  ).perpetualLiquidateLong += positionSizeUsd;
                } else {
                  (protocolData.volumePerpetual as any).perpetualLiquidateShort += positionSizeUsd;
                  (
                    protocolData.breakdown[vaultConfig.chain][indexToken].volumePerpetual as any
                  ).perpetualLiquidateShort += positionSizeUsd;
                }
              }

              break;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
