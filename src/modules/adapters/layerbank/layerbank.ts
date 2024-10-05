import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { TimeUnits } from '../../../configs/constants';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { LayerBankProtocolConfig } from '../../../configs/protocols/layerbank';
import LayerbankCoreAbi from '../../../configs/abi/layerbank/Core.json';
import LTokenAbi from '../../../configs/abi/layerbank/LToken.json';
import PriceCalculatorAbi from '../../../configs/abi/layerbank/PriceCalculator.json';
import RateModelAbi from '../../../configs/abi/layerbank/RateModel.json';
import { ContractCall } from '../../../services/blockchains/domains';
import { decodeEventLog } from 'viem';
import BigNumber from 'bignumber.js';

const EventSignatures = {
  // emitted on Core contracts
  MarketSupply: '0x2bbccc947c61d8ee81518a7f91c8e99f62691dbacce3401d6ab09fb692fbe173',
  MarketRedeem: '0xda2fcb771cce6a80cd6c0101db394f4fd1f8755def9185535cc97509f3e03cdd',

  // emitted on market contracts
  Borrow: '0xe1979fe4c35e0cef342fef5668e2c8e7a7e9f5d5d1ca8fee0ac6c427fa4153af',
  RepayBorrow: '0xa9a154237a69922f8860321d1fec1624a5dbe8a8af89a3dd3d7a759f6c8080d8',
  LiquidateBorrow: '0x298637f684da70674f26509b10f07ec2fbc77a335ab1e7d6215a4b2484d8bb52',
};

export default class LayerbankAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.layerbank';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const layerbankConfig = this.protocolConfig as LayerBankProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
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

    for (const bankConfig of layerbankConfig.banks) {
      if (!protocolData.breakdown[bankConfig.chain]) {
        protocolData.breakdown[bankConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        bankConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        bankConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        bankConfig.chain,
        options.endTime,
      );

      const [allMarkets, priceCalculator] = await this.services.blockchain.evm.multicall({
        chain: bankConfig.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: LayerbankCoreAbi,
            target: bankConfig.core,
            method: 'allMarkets',
            params: [],
          },
          {
            abi: LayerbankCoreAbi,
            target: bankConfig.core,
            method: 'priceCalculator',
            params: [],
          },
        ],
      });

      if (allMarkets && priceCalculator) {
        // get underlying prices
        const oracleCalls: Array<ContractCall> = [];
        const underlyingTokenPrices: { [key: string]: number } = {};
        for (const marketAddress of allMarkets) {
          oracleCalls.push({
            abi: PriceCalculatorAbi,
            target: priceCalculator,
            method: 'getUnderlyingPrice',
            params: [marketAddress],
          });
        }
        const oracleResults = await this.services.blockchain.evm.multicall({
          chain: bankConfig.chain,
          blockNumber: blockNumber,
          calls: oracleCalls,
        });
        for (let i = 0; i < allMarkets.length; i++) {
          underlyingTokenPrices[normalizeAddress(allMarkets[i])] = formatBigNumberToNumber(
            oracleResults[i].toString(),
            18,
          );
        }

        const coreContractLogs = await this.services.blockchain.evm.getContractLogs({
          chain: bankConfig.chain,
          address: bankConfig.core,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const marketAddress of allMarkets) {
          const calls: Array<ContractCall> = [
            {
              abi: LTokenAbi,
              target: marketAddress,
              method: 'underlying',
              params: [],
            },
            {
              abi: LTokenAbi,
              target: marketAddress,
              method: 'getRateModel',
              params: [],
            },
            {
              abi: LTokenAbi,
              target: marketAddress,
              method: 'getCash',
              params: [],
            },
            {
              abi: LTokenAbi,
              target: marketAddress,
              method: 'totalBorrow',
              params: [],
            },
            {
              abi: LTokenAbi,
              target: marketAddress,
              method: 'totalReserve',
              params: [],
            },
            {
              abi: LTokenAbi,
              target: marketAddress,
              method: 'reserveFactor',
              params: [],
            },
          ];

          const [underlying, getRateModel, getCash, totalBorrow, totalReserve, reserveFactor] =
            await this.services.blockchain.evm.multicall({
              chain: bankConfig.chain,
              blockNumber: blockNumber,
              calls: calls,
            });

          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: bankConfig.chain,
            address: underlying,
          });

          if (token) {
            const tokenPriceUsd = underlyingTokenPrices[normalizeAddress(marketAddress)]
              ? underlyingTokenPrices[normalizeAddress(marketAddress)]
              : 0;

            const cash = formatBigNumberToNumber(getCash.toString(), token.decimals);
            const borrow = formatBigNumberToNumber(totalBorrow.toString(), token.decimals);
            const reserve = formatBigNumberToNumber(totalReserve.toString(), token.decimals);

            // totalDeposited = cash + totalBorrow - totalReserve
            const totalDeposited = (cash + borrow - reserve) * tokenPriceUsd;
            const totalBorrowed = borrow * tokenPriceUsd;

            // rates per second
            const getBorrowRate = await this.services.blockchain.evm.readContract({
              chain: bankConfig.chain,
              blockNumber: blockNumber,
              abi: RateModelAbi,
              target: getRateModel,
              method: 'getBorrowRate',
              params: [getCash.toString(), totalBorrow.toString(), totalReserve.toString()],
            });

            const reserveRate = formatBigNumberToNumber(reserveFactor.toString(), 18);
            const borrowRate = formatBigNumberToNumber(getBorrowRate.toString(), 18) * TimeUnits.SecondsPerYear;

            const totalFees = borrow * borrowRate;
            const protocolRevenue = totalFees * reserveRate;
            const supplySideRevenue = totalFees - protocolRevenue;

            protocolData.totalAssetDeposited += totalDeposited;
            (protocolData.totalSupplied as number) += totalDeposited;
            (protocolData.totalBorrowed as number) += totalBorrowed;
            protocolData.totalValueLocked += totalDeposited - totalBorrowed;
            protocolData.totalFees += totalFees;
            protocolData.supplySideRevenue += supplySideRevenue;
            protocolData.protocolRevenue += protocolRevenue;

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

            protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalDeposited;
            (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalDeposited;
            (protocolData.breakdown[token.chain][token.address].totalBorrowed as number) += totalBorrowed;
            protocolData.breakdown[token.chain][token.address].totalValueLocked += totalDeposited - totalBorrowed;
            protocolData.breakdown[token.chain][token.address].totalFees += totalFees;
            protocolData.breakdown[token.chain][token.address].supplySideRevenue += supplySideRevenue;
            protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolRevenue;

            for (const log of coreContractLogs) {
              const signature = log.topics[0];
              if (signature === EventSignatures.MarketSupply || signature === EventSignatures.MarketRedeem) {
                const event: any = decodeEventLog({
                  abi: LayerbankCoreAbi,
                  topics: log.topics,
                  data: log.data,
                });

                if (compareAddress(marketAddress, event.args.lToken)) {
                  const amountUsd =
                    formatBigNumberToNumber(event.args.uAmount.toString(), token.decimals) * tokenPriceUsd;

                  if (signature === EventSignatures.MarketSupply) {
                    (protocolData.volumes.deposit as number) += amountUsd;
                    (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
                  } else {
                    (protocolData.volumes.withdraw as number) += amountUsd;
                    (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += amountUsd;
                  }
                }
              }
            }

            const marketContractLogs = await this.services.blockchain.evm.getContractLogs({
              chain: bankConfig.chain,
              address: marketAddress,
              fromBlock: beginBlock,
              toBlock: endBlock,
            });

            for (const log of marketContractLogs) {
              const signature = log.topics[0];
              if (
                signature === EventSignatures.Borrow ||
                signature === EventSignatures.RepayBorrow ||
                signature === EventSignatures.LiquidateBorrow
              ) {
                const event: any = decodeEventLog({
                  abi: LTokenAbi,
                  topics: log.topics,
                  data: log.data,
                });

                const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals);

                if (signature === EventSignatures.Borrow) {
                  (protocolData.volumes.borrow as number) += amountUsd;
                  (protocolData.breakdown[token.chain][token.address].volumes.borrow as number) += amountUsd;
                } else if (signature === EventSignatures.RepayBorrow) {
                  (protocolData.volumes.repay as number) += amountUsd;
                  (protocolData.breakdown[token.chain][token.address].volumes.repay as number) += amountUsd;
                } else {
                  // repay debts
                  (protocolData.volumes.repay as number) += amountUsd;
                  (protocolData.breakdown[token.chain][token.address].volumes.repay as number) += amountUsd;

                  // liquidate collateral
                  const collateralAddress = await this.services.blockchain.evm.readContract({
                    chain: bankConfig.chain,
                    abi: LTokenAbi,
                    target: event.args.lTokenCollateral,
                    method: 'underlying',
                    params: [],
                  });

                  const collateral = await this.services.blockchain.evm.getTokenInfo({
                    chain: bankConfig.chain,
                    address: collateralAddress,
                  });

                  if (collateral) {
                    const collateralPriceUsd = underlyingTokenPrices[normalizeAddress(event.args.lTokenCollateral)]
                      ? underlyingTokenPrices[normalizeAddress(event.args.lTokenCollateral)]
                      : 0;

                    const currentExechangeRate = await this.services.blockchain.evm.readContract({
                      chain: bankConfig.chain,
                      abi: LTokenAbi,
                      target: event.args.lTokenCollateral,
                      method: 'exchangeRate',
                      params: [],
                      blockNumber: Number(log.blockNumber),
                    });

                    if (currentExechangeRate) {
                      const seizeAmount = new BigNumber(event.args.seizeAmount.toString());
                      const mantissa = 18 + collateral.decimals - 8;
                      const oneCTokenInUnderlying = new BigNumber(currentExechangeRate).dividedBy(
                        new BigNumber(10).pow(mantissa),
                      );
                      const collateralAmount = seizeAmount
                        .multipliedBy(oneCTokenInUnderlying)
                        .dividedBy(1e8)
                        .toNumber();
                      const collateralAmountUsd = collateralAmount * collateralPriceUsd;

                      (protocolData.volumes.liquidation as number) += collateralAmountUsd;

                      if (!protocolData.breakdown[collateral.chain][collateral.address]) {
                        protocolData.breakdown[collateral.chain][collateral.address] = {
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
                      (protocolData.breakdown[collateral.chain][collateral.address].volumes.liquidation as number) +=
                        collateralAmountUsd;
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
