import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import GmxMarkets from '../data/constants/GmxMarkets.json';

export interface GmxVaultV1Config {
  chain: string;
  birthday: number;
  vault: string;
}

export interface GmxMarketV2Config {
  chain: string;
  birthblock: number;
  marketToken: string;
  indexToken: string;
  longToken: string;
  shortToken: string;
}

export interface GmxVaultV2Config {
  chain: string;
  birthday: number;
  eventEmitter: string;
  markets: Array<GmxMarketV2Config>;
}

export interface GmxProtocolConfig extends ProtocolConfig {
  v1Vaults: Array<GmxVaultV1Config>;
  v2Vaults: Array<GmxVaultV2Config>;
}

export const GmxConfigs: GmxProtocolConfig = {
  protocol: ProtocolNames.gmx,
  birthday: 1630454400, // Wed Sep 01 2021 00:00:00 GMT+0000
  v1Vaults: [
    // {
    //   chain: ChainNames.arbitrum,
    //   birthday: 1630454400, // Wed Sep 01 2021 00:00:00 GMT+0000
    //   vault: '0x489ee077994b6658eafa855c308275ead8097c4a',
    // },
    // {
    //   chain: ChainNames.avalanche,
    //   birthday: 1639785600, // Sat Dec 18 2021 00:00:00 GMT+0000
    //   vault: '0x9ab2De34A33fB459b538c43f251eB825645e8595',
    // },
  ],
  v2Vaults: [
    {
      chain: ChainNames.arbitrum,
      birthday: 1688515200, // Wed Jul 05 2023 00:00:00 GMT+0000
      eventEmitter: '0xC8ee91A54287DB53897056e12D9819156D3822Fb',
      markets: GmxMarkets.filter((market) => market.chain === ChainNames.arbitrum),
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1688515200, // Wed Jul 05 2023 00:00:00 GMT+0000
      eventEmitter: '0xDb17B211c34240B014ab6d61d4A31FA0C0e20c26',
      markets: GmxMarkets.filter((market) => market.chain === ChainNames.avalanche),
    },
  ],
};
