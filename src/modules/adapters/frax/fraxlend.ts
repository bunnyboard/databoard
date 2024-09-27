import { FraxlendProtocolConfig } from '../../../configs/protocols/fraxlend';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import FraxlendPairAbi from '../../../configs/abi/frax/FraxlendPair.json';
import FraxlendPairV2Abi from '../../../configs/abi/frax/FraxlendPairV2.json';
import FraxlendPairDeployerAbi from '../../../configs/abi/frax/FraxlendPairDeployer.json';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { TimeUnits } from '../../../configs/constants';
import AdapterDataHelper from '../helpers';

// const FraxPairEvents = {
//   Deposit: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',
//   Withdraw: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
//   BorrowAsset: '0x01348584ec81ac7acd52b7d66d9ade986dd909f3d513881c190fc31c90527efe',
//   RepayAsset: '0x9dc1449a0ff0c152e18e8289d865b47acc6e1b76b1ecb239c13d6ee22a9206a7',
//   AddCollateral: '0xa32435755c235de2976ed44a75a2f85cb01faf0c894f639fe0c32bb9455fea8f',
//   RemoveCollateral: '0xbc290bb45104f73cf92115c9603987c3f8fd30c182a13603d8cffa49b5f59952',
//   Liquidate: '0x35f432a64bd3767447a456650432406c6cacb885819947a202216eeea6820ecf',
// };

export default class FraxlendAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.fraxlend 🏦';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
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

    const fraxlendConfig = this.protocolConfig as FraxlendProtocolConfig;
    for (const factoryConfig of fraxlendConfig.factories) {
      if (factoryConfig.birthday > options.timestamp) {
        continue;
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.timestamp,
      );

      const allPairAddresses = await this.services.blockchain.evm.readContract({
        chain: factoryConfig.chain,
        abi: FraxlendPairDeployerAbi,
        target: factoryConfig.factory,
        method: 'getAllPairAddresses',
        params: [],
        blockNumber: blockNumber,
      });

      for (const pairAddress of allPairAddresses) {
        if (factoryConfig.blacklists.includes(normalizeAddress(pairAddress))) {
          continue;
        }

        const [asset, collateralContract, totalAsset, totalBorrow, totalCollateral, currentRateInfo, exchangeRateInfo] =
          await this.services.blockchain.evm.multicall({
            chain: factoryConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: FraxlendPairAbi,
                target: pairAddress,
                method: 'asset',
                params: [],
              },
              {
                abi: FraxlendPairAbi,
                target: pairAddress,
                method: 'collateralContract',
                params: [],
              },
              {
                abi: FraxlendPairAbi,
                target: pairAddress,
                method: 'totalAsset',
                params: [],
              },
              {
                abi: FraxlendPairAbi,
                target: pairAddress,
                method: 'totalBorrow',
                params: [],
              },
              {
                abi: FraxlendPairAbi,
                target: pairAddress,
                method: 'totalCollateral',
                params: [],
              },
              {
                abi: factoryConfig.fraxlendPairVersion === 1 ? FraxlendPairAbi : FraxlendPairV2Abi,
                target: pairAddress,
                method: 'currentRateInfo',
                params: [],
              },
              {
                abi: factoryConfig.fraxlendPairVersion === 1 ? FraxlendPairAbi : FraxlendPairV2Abi,
                target: pairAddress,
                method: 'exchangeRateInfo',
                params: [],
              },
            ],
          });

        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: factoryConfig.chain,
          address: asset,
        });
        const collateral = await this.services.blockchain.evm.getTokenInfo({
          chain: factoryConfig.chain,
          address: collateralContract,
        });
        if (token && collateral) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: factoryConfig.chain,
            address: token.address,
            timestamp: blockNumber,
          });

          let collateralPriceUsd = 0;

          // try get collateral price from fraxlend pair oracle
          if (factoryConfig.fraxlendPairVersion === 1) {
            const exchangeRate = formatBigNumberToNumber(exchangeRateInfo[1].toString(), collateral.decimals);
            collateralPriceUsd = exchangeRate > 0 ? tokenPriceUsd / exchangeRate : 0;
          } else if (factoryConfig.fraxlendPairVersion === 2) {
            const exchangeRate = formatBigNumberToNumber(exchangeRateInfo[4].toString(), collateral.decimals);
            collateralPriceUsd = exchangeRate > 0 ? tokenPriceUsd / exchangeRate : 0;
          }

          if (collateralPriceUsd === 0) {
            // try get collateral price from oracle configs
            collateralPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: factoryConfig.chain,
              address: collateral.address,
              timestamp: blockNumber,
            });
          }

          console.log(pairAddress, token.symbol, collateral.symbol, collateralPriceUsd);

          const totalDepositedUsd = formatBigNumberToNumber(totalAsset[0].toString(), token.decimals) * tokenPriceUsd;
          const totalBorrowededUsd = formatBigNumberToNumber(totalBorrow[0].toString(), token.decimals) * tokenPriceUsd;
          const totalCollateralDepositedUsd =
            formatBigNumberToNumber(totalCollateral.toString(), collateral.decimals) * collateralPriceUsd;

          // RatePerSec * SecondsPerYear
          const borrowRate = formatBigNumberToNumber(currentRateInfo[3].toString(), 18) * TimeUnits.SecondsPerYear;
          const protocolFeeRate = formatBigNumberToNumber(currentRateInfo[1].toString(), 5);

          const borrowFees = (totalBorrowededUsd * borrowRate) / TimeUnits.DaysPerYear;
          const protocolRevenue = borrowFees * protocolFeeRate;
          const supplySideRevenue = borrowFees - protocolRevenue;

          protocolData.totalAssetDeposited += totalDepositedUsd + totalCollateralDepositedUsd;
          protocolData.totalValueLocked += totalDepositedUsd + totalCollateralDepositedUsd - totalBorrowededUsd;
          (protocolData.totalSupplied as number) += totalDepositedUsd;
          (protocolData.totalBorrowed as number) += totalBorrowededUsd;
          protocolData.totalFees += borrowFees;
          protocolData.supplySideRevenue += supplySideRevenue;
          protocolData.protocolRevenue += protocolRevenue;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
