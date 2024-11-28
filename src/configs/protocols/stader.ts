import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface StaderEthxConfig {
  chain: string;
  birthday: number;
  ethx: string;
  stakingPoolManager: string;
  protocolFeeRate: number;
}

export interface StaderBnbxConfig {
  chain: string;
  birthday: number;
  bnbx: string;
  stakingPoolManager: string;
  protocolFeeRate: number;
}

export interface StaderMaticxConfig {
  chain: string;
  birthday: number;
  maticx: string;
  protocolFeeRate: number;
  token: string; // MATIC/POl on ethereum
}

export interface StaderProtocolConfig extends ProtocolConfig {
  ethx: StaderEthxConfig;
  bnbx: StaderBnbxConfig;
  maticx: StaderMaticxConfig;
}

export const StaderConfigs: StaderProtocolConfig = {
  protocol: ProtocolNames.stader,
  category: ProtocolCategories.liquidStaking,
  birthday: 1686096000, // Wed Jun 07 2023 00:00:00 GMT+0000
  ethx: {
    chain: ChainNames.ethereum,
    birthday: 1686096000, // Wed Jun 07 2023 00:00:00 GMT+0000
    ethx: '0xA35b1B31Ce002FBF2058D22F30f95D405200A15b',
    stakingPoolManager: '0xcf5EA1b38380f6aF39068375516Daf40Ed70D299',
    // https://www.staderlabs.com/docs-v1/Ethereum/ETHx%20Staking/faqs#6-what-fees-are-associated-with-staking
    protocolFeeRate: 0.1, // 10%
  },
  bnbx: {
    chain: ChainNames.bnbchain,
    birthday: 1722556800, // Fri Aug 02 2024 00:00:00 GMT+0000
    bnbx: '0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275',
    stakingPoolManager: '0x3b961e83400D51e6E1AF5c450d3C7d7b80588d28',
    // https://www.staderlabs.com/docs-v1/binance/fees
    protocolFeeRate: 0.1, // 10%
  },
  maticx: {
    chain: ChainNames.ethereum,
    birthday: 1649808000, // Wed Apr 13 2022 00:00:00 GMT+0000
    maticx: '0xf03a7eb46d01d9ecaa104558c732cf82f6b6b645',
    // https://www.staderlabs.com/docs-v1/polygon/fees
    protocolFeeRate: 0.11, // 11%
    token: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  },
};
