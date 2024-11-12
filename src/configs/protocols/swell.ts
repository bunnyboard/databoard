import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { AddressZero } from '../constants';
import { ChainNames, ProtocolNames } from '../names';

export interface SwellLiquidStakingConfig {
  chain: string;
  birthday: number;
  version: 'eth' | 'yearnVault';
  token: string;
  address: string;
  exitQueue?: string;
  protocolFeeRate: number;
}

export interface SwellProtocolConfig extends ProtocolConfig {
  liquidStakingconfigs: Array<SwellLiquidStakingConfig>;
}

export const SwellConfigs: SwellProtocolConfig = {
  protocol: ProtocolNames.swell,
  category: ProtocolCategories.liquidStaking,
  birthday: 1681344000, // Thu Apr 13 2023 00:00:00 GMT+0000

  liquidStakingconfigs: [
    // swETH
    {
      chain: ChainNames.ethereum,
      birthday: 1681344000, // Thu Apr 13 2023 00:00:00 GMT+0000
      version: 'eth',
      token: AddressZero,
      address: '0xf951e335afb289353dc249e82926178eac7ded78',
      exitQueue: '0x48C11b86807627AF70a34662D4865cF854251663',

      // https://docs.swellnetwork.io/swell-staking/sweth-liquid-staking/sweth-v1.0-system-design/rewards-and-distribution/liquid-staking-rewards-and-fees
      protocolFeeRate: 0.1, // 10%
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1706313600, // Sat Jan 27 2024 00:00:00 GMT+0000
      version: 'eth',
      token: AddressZero,
      address: '0xfae103dc9cf190ed75350761e95403b7b8afa6c0',
      exitQueue: '0x58749C46Ffe97e4d79508a2C781C440f4756f064',

      // https://docs.swellnetwork.io/swell-staking/rsweth-liquid-restaking/liquid-restaking-rewards-and-fees
      protocolFeeRate: 0.1, // 10%
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1723507200, // Tue Aug 13 2024 00:00:00 GMT+0000
      version: 'yearnVault',
      token: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
      address: '0x8db2350d78abc13f5673a411d4700bcf87864dde',
      protocolFeeRate: 0,
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1726876800, // Sat Sep 21 2024 00:00:00 GMT+0000
      version: 'yearnVault',
      token: '0x0a6E7Ba5042B38349e437ec6Db6214AEC7B35676', // SWELL
      address: '0x358d94b5b2F147D741088803d932Acb566acB7B6',
      protocolFeeRate: 0,
    },
  ],
};
