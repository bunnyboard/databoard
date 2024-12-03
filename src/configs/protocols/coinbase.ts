import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface CbethProtocolConfig extends ProtocolConfig {
  chain: string;
  cbeth: string;
}

export const CbethConfigs: CbethProtocolConfig = {
  protocol: ProtocolNames.cbeth,
  birthday: 1643932800, // Fri Feb 04 2022 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  cbeth: '0xbe9895146f7af43049ca1c1ae358b0541ea49704',
};
