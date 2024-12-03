import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SlisbnbProtocolConfig extends ProtocolConfig {
  chain: string;
  slisBNB: string;
  stakeManager: string;
}

export const SlisBnbConfigs: SlisbnbProtocolConfig = {
  protocol: ProtocolNames.slisbnb,
  birthday: 1688169600, // Sat Jul 01 2023 00:00:00 GMT+0000
  chain: ChainNames.bnbchain,
  slisBNB: '0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B',
  stakeManager: '0x1adB950d8bB3dA4bE104211D5AB038628e477fE6',
};
