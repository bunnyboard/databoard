import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { SilofinanceProtocolConfig } from '../../../configs/protocols/silofinance';
import { getSiloInfoV1, GetSiloInfoResult } from './v1';
import { getSiloInfoV2 } from './v2';

export default class SilofinanceAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.silofinance';

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
        flashloan: 0,
      },
    };

    const siloConfig = this.protocolConfig as SilofinanceProtocolConfig;
    for (const repositoryConfig of siloConfig.repositories) {
      if (repositoryConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[repositoryConfig.chain]) {
        protocolData.breakdown[repositoryConfig.chain] = {};
      }

      for (const siloAddress of repositoryConfig.silos) {
        const siloInfo: GetSiloInfoResult =
          repositoryConfig.version === 1
            ? await getSiloInfoV1({
                services: this.services,
                ...options,
                params: {
                  chain: repositoryConfig.chain,
                  lens: repositoryConfig.lens,
                  repository: repositoryConfig.repository,
                  siloAddress: siloAddress,
                },
              })
            : await getSiloInfoV2({
                services: this.services,
                ...options,
                params: {
                  chain: repositoryConfig.chain,
                  lens: repositoryConfig.lens,
                  repository: repositoryConfig.repository,
                  siloConfig: siloAddress,
                },
              });

        for (const token of siloInfo.tokens) {
          protocolData.totalAssetDeposited += token.totalDepositUsd;
          protocolData.totalValueLocked += token.totalDepositUsd - token.totalBorrowUsd;
          protocolData.totalFees += token.totalFeeUsd;
          protocolData.protocolRevenue += token.protocolFeeUsd;
          protocolData.supplySideRevenue += token.totalFeeUsd - token.protocolFeeUsd;
          (protocolData.totalSupplied as number) += token.totalDepositUsd;
          (protocolData.totalBorrowed as number) += token.totalBorrowUsd;
          (protocolData.volumes.deposit as number) += token.volumes.deposit;
          (protocolData.volumes.withdraw as number) += token.volumes.withdraw;
          (protocolData.volumes.borrow as number) += token.volumes.borrow;
          (protocolData.volumes.repay as number) += token.volumes.repay;
          (protocolData.volumes.liquidation as number) += token.volumes.liquidate;
          if (token.volumes.flashloan) {
            (protocolData.volumes.flashloan as number) += token.volumes.flashloan;
          }

          if (!protocolData.breakdown[token.token.chain][token.token.address]) {
            protocolData.breakdown[token.token.chain][token.token.address] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
              totalBorrowed: 0,
              volumes: {
                deposit: 0,
                withdraw: 0,
                borrow: 0,
                repay: 0,
                liquidation: 0,
                flashloan: 0,
              },
            };
          }
          protocolData.breakdown[token.token.chain][token.token.address].totalAssetDeposited += token.totalDepositUsd;
          protocolData.breakdown[token.token.chain][token.token.address].totalValueLocked +=
            token.totalDepositUsd - token.totalBorrowUsd;
          protocolData.breakdown[token.token.chain][token.token.address].totalFees += token.totalFeeUsd;
          protocolData.breakdown[token.token.chain][token.token.address].protocolRevenue += token.protocolFeeUsd;
          protocolData.breakdown[token.token.chain][token.token.address].supplySideRevenue +=
            token.totalFeeUsd - token.protocolFeeUsd;
          (protocolData.breakdown[token.token.chain][token.token.address].totalSupplied as number) +=
            token.totalDepositUsd;
          (protocolData.breakdown[token.token.chain][token.token.address].totalBorrowed as number) +=
            token.totalBorrowUsd;
          (protocolData.breakdown[token.token.chain][token.token.address].volumes.deposit as number) +=
            token.volumes.deposit;
          (protocolData.breakdown[token.token.chain][token.token.address].volumes.withdraw as number) +=
            token.volumes.withdraw;
          (protocolData.breakdown[token.token.chain][token.token.address].volumes.borrow as number) +=
            token.volumes.borrow;
          (protocolData.breakdown[token.token.chain][token.token.address].volumes.repay as number) +=
            token.volumes.repay;
          (protocolData.breakdown[token.token.chain][token.token.address].volumes.liquidation as number) +=
            token.volumes.liquidate;
          if (token.volumes.flashloan) {
            (protocolData.breakdown[token.token.chain][token.token.address].volumes.flashloan as number) +=
              token.volumes.flashloan;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
