import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface EthxProtocolConfig extends ProtocolConfig {
  chain: string;
  birthday: number;
  ethx: string;
  stakingPoolManager: string;
  protocolFeeRate: number;
}

export const EthxConfigs: EthxProtocolConfig = {
  protocol: ProtocolNames.ethx,
  birthday: 1686096000, // Wed Jun 07 2023 00:00:00 GMT+0000
  category: ProtocolCategories.liquidStaking,
  chain: ChainNames.ethereum,
  ethx: '0xA35b1B31Ce002FBF2058D22F30f95D405200A15b',
  stakingPoolManager: '0xcf5EA1b38380f6aF39068375516Daf40Ed70D299',
  // https://www.staderlabs.com/docs-v1/Ethereum/ETHx%20Staking/faqs#6-what-fees-are-associated-with-staking
  protocolFeeRate: 0.1, // 10%
};
