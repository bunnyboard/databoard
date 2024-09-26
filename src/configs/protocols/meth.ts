import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface MethProtocolConfig extends ProtocolConfig {
  chain: string;
  address: string; // mETH token address
}

export const MethConfigs: MethProtocolConfig = {
  protocol: ProtocolNames.meth,
  category: ProtocolCategories.liquidStaking,
  birthday: 1696636800, // Sat Oct 07 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  address: '0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa',
};
