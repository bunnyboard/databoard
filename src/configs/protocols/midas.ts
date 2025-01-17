import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface MidasAssetConfig {
  chain: string;
  birthday: number;
  syntheticCurrency: 'usd' | 'btc';
  syntheticToken: string;
  depositVault: string;
  withdrawVault: string;
}

export interface MidasProtocolConfig extends ProtocolConfig {
  assets: Array<MidasAssetConfig>;
}

export const MidasConfigs: MidasProtocolConfig = {
  protocol: ProtocolNames.midas,
  birthday: 1701475200, // Sat Dec 02 2023 00:00:00 GMT+0000`
  assets: [
    {
      chain: ChainNames.ethereum,
      birthday: 1701475200, // Sat Dec 02 2023 00:00:00 GMT+0000
      syntheticCurrency: 'usd',
      syntheticToken: '0xdd629e5241cbc5919847783e6c96b2de4754e438', // mTBILL
      depositVault: '0x99361435420711723af805f08187c9e6bf796683',
      withdrawVault: '0x569d7dccbf6923350521ecbc28a555a500c4f0ec',
    },
    {
      chain: ChainNames.base,
      birthday: 1726790400, // Fri Sep 20 2024 00:00:00 GMT+0000
      syntheticCurrency: 'usd',
      syntheticToken: '0xDD629E5241CbC5919847783e6C96B2De4754e438', // mTBILL
      depositVault: '0x8978e327FE7C72Fa4eaF4649C23147E279ae1470',
      withdrawVault: '0x2a8c22E3b10036f3AEF5875d04f8441d4188b656',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1718150400, // Wed Jun 12 2024 00:00:00 GMT+0000
      syntheticCurrency: 'usd',
      syntheticToken: '0x2a8c22e3b10036f3aef5875d04f8441d4188b656', // mBASIS
      depositVault: '0xa8a5c4ff4c86a459ebbdc39c5be77833b3a15d88',
      withdrawVault: '0x0d89c1c4799353f3805a3e6c4e1cbbb83217d123',
    },
    {
      chain: ChainNames.base,
      birthday: 1729728000, // Thu Oct 24 2024 00:00:00 GMT+0000
      syntheticCurrency: 'usd',
      syntheticToken: '0x1C2757c1FeF1038428b5bEF062495ce94BBe92b2', // mBASIS
      depositVault: '0x80b666d60293217661e7382737bb3e42348f7ce5',
      withdrawVault: '0xf804a646c034749b5484bf7dfe875f6a4f969840',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1729296000, // Sat Oct 19 2024 00:00:00 GMT+0000
      syntheticCurrency: 'btc',
      syntheticToken: '0x007115416AB6c266329a03B09a8aa39aC2eF7d9d', // mBASIS
      depositVault: '0x10cC8dbcA90Db7606013d8CD2E77eb024dF693bD',
      withdrawVault: '0x30d9D1e76869516AEa980390494AaEd45C3EfC1a',
    },
  ],
};
