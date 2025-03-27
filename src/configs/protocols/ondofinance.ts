import { ProtocolConfig, Token } from '../../types/base';
import { TokensBook } from '../data';
import { ProtocolNames } from '../names';

export interface OndofinanceProtocolConfig extends ProtocolConfig {
  tokens: Array<Token>;
}

export const OndofinanceConfigs: OndofinanceProtocolConfig = {
  protocol: ProtocolNames.ondofinance,
  birthday: 1671667200, // Thu Dec 22 2022 00:00:00 GMT+0000
  tokens: [
    TokensBook.ethereum['0x1b19c19393e2d034d8ff31ff34c81252fcbbee92'],
    // TokensBook.polygon['0xba11c5effa33c4d6f8f593cfa394241cfe925811'],

    TokensBook.ethereum['0x96f6ef951840721adbf46ac996b59e0235cb985c'],
    TokensBook.arbitrum['0x35e050d3c0ec2d29d269a8ecea763a183bdf9a9d'],
    TokensBook.mantle['0x5be26527e817998a7206475496fde1e68957c5a6'],
  ],
};
