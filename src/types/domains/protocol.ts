import { ProtocolCategory } from '../base';
import { FlashloanData } from './flashloan';
import { LendingData } from './lending';
import { MarketData } from './market';

export interface ProtocolData {
  protocol: string;

  category: ProtocolCategory;

  birthday: number;

  // timestamp where data were collected
  timestamp: number;

  // goverance token market data if any
  market?: MarketData;

  // lending markets data if any
  lending?: LendingData;

  // flashloan data if any
  flashloan?: FlashloanData;
}
