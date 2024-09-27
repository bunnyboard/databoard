import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface StakeStoneProtocolConfig extends ProtocolConfig {
  chain: string;
  stone: string;
  vault: string;
  protocolFeeRate: number;
}

export const StakeStoneConfigs: StakeStoneProtocolConfig = {
  protocol: ProtocolNames.stakestone,
  category: ProtocolCategories.liquidStaking,
  birthday: 1695600000, // Mon Sep 25 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  stone: '0x7122985656e38BDC0302Db86685bb972b145bD3C',
  vault: '0xa62f9c5af106feee069f38de51098d9d81b90572',

  // checked protocol FAQs: https://stakestone.io/#/faq
  protocolFeeRate: 0,
};
