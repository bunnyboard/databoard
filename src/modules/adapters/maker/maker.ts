import { MakerProtocolConfig } from '../../../configs/protocols/maker';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import MakerVatAbi from '../../../configs/abi/maker/Vat.json';
import MakerJugAbi from '../../../configs/abi/maker/Jug.json';
import MakerPotAbi from '../../../configs/abi/maker/Pot.json';
import MakerDogAbi from '../../../configs/abi/maker/Dog.json';
import MakerAuthGemJoinAbi from '../../../configs/abi/maker/AuthGemJoin.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { SolidityUnits, TimeUnits } from '../../../configs/constants';
import AaveLendingPoolV3Abi from '../../../configs/abi/aave/LendingPoolV3.json';
import MakerDirectSparkPoolAbi from '../../../configs/abi/maker/D3MAaveV3NoSupplyCapTypePool.json';
import MorphoBlueAbi from '../../../configs/abi/morpho/MorphoBlue.json';
import MorphoAdapterCurveIrmAbi from '../../../configs/abi/morpho/AdapterCurveIrm.json';
import BigNumber from 'bignumber.js';
import { MakerEvents } from './abis';
import { decodeAbiParameters, decodeEventLog } from 'viem';

const LitePsmUsdcModule = {
  birthday: 1720742400,
  earningRate: 0.0425, // 4.25% from Coinbase Custody
  address: '0xf6e72Db5454dd049d0788e411b06CfAF16853042',
  pocket: '0x37305B1cD40574E4C5Ce33f8e8306Be057fD7341',
  collateralAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  ilk: '0x4c4954452d50534d2d555344432d410000000000000000000000000000000000',
};

const DirectSparkModule = {
  birthday: 1682553600,
  sparkLendingPool: '0xc13e21b648a5ee794902342038ff3adab66be987',
  directSparkPool: '0xAfA2DD8a0594B2B24B59de405Da9338C4Ce23437',
};

const DirectMorphoModule = {
  birthday: 1711065600,
  directMorpho: '0x9C259F14E5d9F35A0434cD3C4abbbcaA2f1f7f7E',
  morphoBlue: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
  markets: [
    '0x8f46cd82c4c44a090c3d72bd7a84baf4e69ee50331d5deae514f86fe062b0748',
    '0x39d11026eae1c6ec02aa4c0910778664089cdd97c3fd23f68f7cd05e2e95af48',
    '0xc581c5f70bd1afa283eed57d1418c6432cbff1d862f94eaf58fdd4e46afbb67f',
    '0x8e6aeb10c401de3279ac79b4b2ea15fc94b7d9cfc098d6c2a1ff7b2b26d9d02c',
    '0x1247f1c237eceae0602eab1470a5061a6dd8f734ba88c7cdc5d6109fb0026b28',
    '0xfd8493f09eb6203615221378d89f53fcd92ff4f7d62cca87eece9a2fff59e86f',
    '0xe475337d11be1db07f7c5a156e511f05d1844308e66e17d2ba5da0839d3b34d9',
    '0xdb760246f6859780f6c1b272d47a8f64710777121118e56e0cdb4b8b744a3094',
    '0xb1eac1c0f3ad13fb45b01beac8458c055c903b1bff8cb882346635996a774f77',
    '0x42dcfb38bb98767afb6e38ccf90d59d0d3f0aa216beb3a234f12850323d17536',
    '0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b',
    '0xd95c5285ed6009b272a25a94539bd1ae5af0e9020ad482123e01539ae43844e1',
  ],
};

// there are collaterals have no actual stability fee parameter set,
// revenue is generated off chain and transferred into the surplus buffer through an RwaJar
const RwaEarningRates: any = {
  '0x5257413031352d41000000000000000000000000000000000000000000000000': 0.045, // 4.5%
  '0x5257413030372d41000000000000000000000000000000000000000000000000': 0.04, // 4%
  '0x5257413030392d41000000000000000000000000000000000000000000000000': 0.0011, // 0.11%
};

export default class MakerAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.maker';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const makerConfig = this.protocolConfig as MakerProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalBorrowed: 0,
      volumes: {
        deposit: 0, // deposit collateral/game
        withdraw: 0, // withdraw collateral/game
        borrow: 0,
        repay: 0,
        liquidation: 0,
        flashloan: 0,
      },
    };

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      makerConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      makerConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      makerConfig.chain,
      options.endTime,
    );

    let totalBorrowFees = 0;
    let daiPayToSavingOneDay = 0;

    const [vatDebt, jugBase, potDsr, potPie, potChi] = await this.services.blockchain.evm.multicall({
      chain: makerConfig.chain,
      calls: [
        {
          abi: MakerVatAbi,
          target: makerConfig.vat,
          method: 'debt',
          params: [],
        },
        {
          abi: MakerJugAbi,
          target: makerConfig.jug,
          method: 'base',
          params: [],
        },
        {
          abi: MakerPotAbi,
          target: makerConfig.pot,
          method: 'dsr',
          params: [],
        },
        {
          abi: MakerPotAbi,
          target: makerConfig.pot,
          method: 'Pie',
          params: [],
        },
        {
          abi: MakerPotAbi,
          target: makerConfig.pot,
          method: 'chi',
          params: [],
        },
      ],
      blockNumber: blockNumber,
    });

    (protocolData.totalBorrowed as number) = formatBigNumberToNumber(vatDebt.toString(), SolidityUnits.RadDecimals);

    // https://docs.makerdao.com/smart-contract-modules/rates-module#a-note-on-setting-rates
    const daiSavingRate =
      formatBigNumberToNumber(potDsr.toString(), SolidityUnits.RayDecimals) ** TimeUnits.SecondsPerYear - 1;
    const daiSavingTotalDeposited =
      formatBigNumberToNumber(potPie.toString(), 18) *
      formatBigNumberToNumber(potChi.toString(), SolidityUnits.RayDecimals);
    daiPayToSavingOneDay = daiSavingRate * daiSavingTotalDeposited;

    // get DAI events, DAI join
    // count borrow/repay volumes
    const daiJoinLogs = await this.services.blockchain.evm.getContractLogs({
      chain: makerConfig.chain,
      address: makerConfig.daiJoin,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of daiJoinLogs) {
      const signature = log.topics[0];
      const address = normalizeAddress(log.address);

      if (signature === MakerEvents.Join || signature === MakerEvents.PsmJoin || signature === MakerEvents.Exit) {
        const rawAmount = decodeAbiParameters([{ type: 'uint256' }], log.topics[3])[0].toString();

        if (compareAddress(address, makerConfig.daiJoin)) {
          // borrow/repay DAI
          const amountDai = formatBigNumberToNumber(rawAmount, 18);
          if (signature === MakerEvents.Join) {
            (protocolData.volumes.repay as number) += amountDai;
          } else {
            (protocolData.volumes.borrow as number) += amountDai;
          }
        }
      }
    }

    const liquidationLogs = await this.services.blockchain.evm.getContractLogs({
      chain: makerConfig.chain,
      address: makerConfig.dog,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const gemConfig of makerConfig.gems) {
      if (gemConfig.birthday <= options.timestamp) {
        const collateralToken = await this.services.blockchain.evm.getTokenInfo({
          chain: makerConfig.chain,
          address: gemConfig.collateralAddress,
        });
        if (collateralToken) {
          const rawPrice = await this.services.oracle.getTokenPriceUsd({
            chain: makerConfig.chain,
            address: gemConfig.collateralAddress,
            timestamp: options.timestamp,
          });
          const collateralPriceUsd = rawPrice ? Number(rawPrice) : 0;

          const [gemBalance, vatInfo, jugInfo] = await this.services.blockchain.evm.multicall({
            chain: makerConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: Erc20Abi,
                target: gemConfig.collateralAddress,
                method: 'balanceOf',
                params: [gemConfig.address],
              },
              {
                abi: MakerVatAbi,
                target: makerConfig.vat,
                method: 'ilks',
                params: [gemConfig.ilk],
              },
              {
                abi: MakerJugAbi,
                target: makerConfig.jug,
                method: 'ilks',
                params: [gemConfig.ilk],
              },
            ],
          });

          const collateralBalanceUsd =
            formatBigNumberToNumber(gemBalance.toString(), collateralToken.decimals) * collateralPriceUsd;

          // https://docs.makerdao.com/smart-contract-modules/rates-module/jug-detailed-documentation
          const art = formatBigNumberToNumber(vatInfo[0].toString(), 18);
          const rate = formatBigNumberToNumber(vatInfo[1].toString(), SolidityUnits.RayDecimals);
          const duty = formatBigNumberToNumber(jugInfo[0].toString(), SolidityUnits.RayDecimals);
          const base = formatBigNumberToNumber(jugBase.toString(), SolidityUnits.RayDecimals);

          const elapsed = 3600;
          const deltaRate = (duty + base) ** elapsed * rate - rate;
          const interestAmountOneDay = art * ((deltaRate * TimeUnits.SecondsPerYear) / elapsed);

          totalBorrowFees += interestAmountOneDay;

          if (RwaEarningRates[gemConfig.ilk]) {
            totalBorrowFees += collateralBalanceUsd * RwaEarningRates[gemConfig.ilk];
          }

          protocolData.totalAssetDeposited += collateralBalanceUsd;
          protocolData.totalValueLocked += collateralBalanceUsd;

          const gemLogs = await this.services.blockchain.evm.getContractLogs({
            chain: makerConfig.chain,
            address: gemConfig.address,
            fromBlock: beginBlock,
            toBlock: endBlock,
          });
          for (const gemLog of gemLogs) {
            const signature = gemLog.topics[0];
            const address = normalizeAddress(gemLog.address);

            if (signature === MakerEvents.Join || signature === MakerEvents.PsmJoin || signature === MakerEvents.Exit) {
              if (compareAddress(address, gemConfig.address)) {
                const rawAmount = decodeAbiParameters([{ type: 'uint256' }], gemLog.topics[3])[0].toString();
                const amountUsd =
                  formatBigNumberToNumber(rawAmount.toString(), collateralToken.decimals) * collateralPriceUsd;
                if (signature === MakerEvents.Exit) {
                  // withdraw
                  (protocolData.volumes.withdraw as number) += amountUsd;
                } else {
                  (protocolData.volumes.deposit as number) += amountUsd;
                }
              }
            } else if (signature === MakerEvents.AuthJoin || signature === MakerEvents.AuthExit) {
              if (compareAddress(address, gemConfig.address)) {
                const event: any = decodeEventLog({
                  abi: MakerAuthGemJoinAbi,
                  data: gemLog.data,
                  topics: gemLog.topics,
                });

                const amountUsd =
                  formatBigNumberToNumber(event.args.amt.toString(), collateralToken.decimals) * collateralPriceUsd;

                if (signature === MakerEvents.AuthJoin) {
                  (protocolData.volumes.deposit as number) += amountUsd;
                } else {
                  (protocolData.volumes.withdraw as number) += amountUsd;
                }
              }
            }
          }

          for (const log of liquidationLogs) {
            const signature = log.topics[0];

            if (signature === MakerEvents.Bark) {
              // liquidation
              // https://docs.makerdao.com/smart-contract-modules/dog-and-clipper-detailed-documentation
              // https://etherscan.io/tx/0x01c4e90a4c080a3d496030a8038f2c50d92de569ebc31866e28a575e37cb3da5#eventlog
              const event: any = decodeEventLog({
                abi: MakerDogAbi,
                data: log.data,
                topics: log.topics,
              });

              if (event.args.ilk === gemConfig.ilk) {
                const amountUsd = formatBigNumberToNumber(event.args.ink.toString(), 18) * collateralPriceUsd;
                (protocolData.volumes.liquidation as number) += amountUsd;
              }
            }
          }
        }
      }
    }

    // lite psm module
    if (options.timestamp >= LitePsmUsdcModule.birthday) {
      const collateralToken = await this.services.blockchain.evm.getTokenInfo({
        chain: makerConfig.chain,
        address: LitePsmUsdcModule.collateralAddress,
      });
      if (collateralToken) {
        const rawPrice = await this.services.oracle.getTokenPriceUsd({
          chain: makerConfig.chain,
          address: LitePsmUsdcModule.collateralAddress,
          timestamp: options.timestamp,
        });
        const collateralPriceUsd = rawPrice ? Number(rawPrice) : 0;

        const gemBalance = await this.services.blockchain.evm.readContract({
          chain: makerConfig.chain,
          blockNumber: blockNumber,
          abi: Erc20Abi,
          target: LitePsmUsdcModule.collateralAddress,
          method: 'balanceOf',
          params: [LitePsmUsdcModule.pocket],
        });

        const collateralBalanceUsd =
          formatBigNumberToNumber(gemBalance.toString(), collateralToken.decimals) * collateralPriceUsd;

        protocolData.totalAssetDeposited += collateralBalanceUsd;
        protocolData.totalValueLocked += collateralBalanceUsd;

        totalBorrowFees += collateralBalanceUsd * LitePsmUsdcModule.earningRate;
      }
    }

    // direct saprk pool
    if (options.timestamp >= DirectSparkModule.birthday) {
      const [reserveData, assetBalance] = await this.services.blockchain.evm.multicall({
        chain: makerConfig.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: AaveLendingPoolV3Abi,
            target: DirectSparkModule.sparkLendingPool,
            method: 'getReserveData',
            params: [makerConfig.dai],
          },
          {
            abi: MakerDirectSparkPoolAbi,
            target: DirectSparkModule.directSparkPool,
            method: 'assetBalance',
            params: [],
          },
        ],
      });
      const balance = formatBigNumberToNumber(assetBalance.toString(), 18);
      const liquidityRate = formatBigNumberToNumber(
        reserveData.currentLiquidityRate.toString(),
        SolidityUnits.RayDecimals,
      );

      totalBorrowFees += balance * liquidityRate;
    }

    // direct morpho
    if (options.timestamp >= DirectMorphoModule.birthday) {
      let totalEarnedFeesFromMorphoVault = 0;
      for (const marketId of DirectMorphoModule.markets) {
        const [
          [loanToken, collateralToken, oracle, irm, ltv],
          [totalSupplyAssets, totalSupplyShares, totalBorrowAssets, totalBorrowShares, lastUpdate, fee],
        ] = await this.services.blockchain.evm.multicall({
          chain: makerConfig.chain,
          blockNumber: blockNumber,
          calls: [
            {
              abi: MorphoBlueAbi,
              target: DirectMorphoModule.morphoBlue,
              method: 'idToMarketParams',
              params: [marketId],
            },
            {
              abi: MorphoBlueAbi,
              target: DirectMorphoModule.morphoBlue,
              method: 'market',
              params: [marketId],
            },
          ],
        });

        const borrowRateView = await this.services.blockchain.evm.readContract({
          chain: makerConfig.chain,
          blockNumber: blockNumber,
          abi: MorphoAdapterCurveIrmAbi,
          target: irm, // irm
          method: 'borrowRateView',
          params: [
            [
              loanToken, // loanToken
              collateralToken, // collateralToken
              oracle, // oracle
              irm, // irm
              ltv, // ltv
            ],
            [
              totalSupplyAssets.toString(),
              totalSupplyShares.toString(),
              totalBorrowAssets.toString(),
              totalBorrowShares.toString(),
              lastUpdate.toString(),
              fee.toString(),
            ],
          ],
        });

        // https://docs.morpho.org/morpho/contracts/irm/#calculations
        // borrowRatePerSecond from Morpho Irm
        // compound per day
        const borrowRate = new BigNumber(borrowRateView ? borrowRateView.toString() : '0').dividedBy(1e18);
        const borrowAPY = new BigNumber(1)
          .plus(borrowRate.multipliedBy(TimeUnits.SecondsPerYear).dividedBy(TimeUnits.DaysPerYear))
          .pow(TimeUnits.DaysPerYear)
          .minus(1);

        // supplyAPY = borrowAPY x utilization x (1 - fee)
        const supplyApy = new BigNumber(totalBorrowAssets.toString()).gt(0)
          ? borrowAPY
              .multipliedBy(new BigNumber(totalBorrowAssets.toString()).dividedBy(totalSupplyAssets.toString()))
              .toNumber()
          : 0;

        totalEarnedFeesFromMorphoVault += supplyApy * formatBigNumberToNumber(totalSupplyAssets.toString(), 18);
      }

      totalBorrowFees += totalEarnedFeesFromMorphoVault;
    }

    protocolData.totalFees += totalBorrowFees / TimeUnits.DaysPerYear;
    protocolData.protocolRevenue += (totalBorrowFees - daiPayToSavingOneDay) / TimeUnits.DaysPerYear;

    return protocolData;
  }
}
