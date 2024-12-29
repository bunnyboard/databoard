import { ProtocolConfig } from '../../types/base';

export interface ResolvProtocolConfig extends ProtocolConfig {
  chain: string;
  treasury: string;
  usr: string;
  usrRequestManager: string;

  assets: Array<string>;
}
