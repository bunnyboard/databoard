import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface FluidMarketConfig {
  chain: string;
  liquidity: string;
  liquidityResolver: string;
  vaultResolverV1?: string;
  vaultResolverV2: string;
  dexResolver?: string;
  birthday: number;
}

export interface FluidProtocolConfig extends ProtocolConfig {
  markets: Array<FluidMarketConfig>;
}

export const FluidConfigs: FluidProtocolConfig = {
  protocol: ProtocolNames.fluid,
  birthday: 1717200000, // Sat Jun 01 2024 00:00:00 GMT+0000
  markets: [
    {
      chain: ChainNames.ethereum,
      birthday: 1717200000, // Sat Jun 01 2024 00:00:00 GMT+0000
      liquidity: '0x52aa899454998be5b000ad077a46bbe360f4e497',
      liquidityResolver: '0xd7588f6c99605ab274c211a0afec60947668a8cb',
      vaultResolverV1: '0x56ddf84b2c94bf3361862fcedb704c382dc4cd32',
      vaultResolverV2: '0x58f24b9fcEF1847d4ec43AF62ff1ac72066c5480',
      dexResolver: '0x7af0C11F5c787632e567e6418D74e5832d8FFd4c',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1718150400, // Wed Jun 12 2024 00:00:00 GMT+0000
      liquidity: '0x52aa899454998be5b000ad077a46bbe360f4e497',
      liquidityResolver: '0x46859d33e662d4bf18eeed88f74c36256e606e44',
      vaultResolverV2: '0x77648d39be25a1422467060e11e5b979463bea3d',
      dexResolver: '0x1De42938De444d376eBc298E15D21F409b946E6D',
    },
    {
      chain: ChainNames.base,
      birthday: 1721606400, // Mon Jul 22 2024 00:00:00 GMT+0000
      liquidity: '0x52Aa899454998Be5b000Ad077a46Bbe360F4e497',
      liquidityResolver: '0x35A915336e2b3349FA94c133491b915eD3D3b0cd',
      vaultResolverV2: '0x94695A9d0429aD5eFec0106a467aDEaDf71762F9',
      dexResolver: '0x93f587618A5380f40329E652f8D26CB16dAE3a47',
    },
  ],
};
