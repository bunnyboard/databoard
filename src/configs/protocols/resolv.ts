import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface ResolvProtocolConfig extends ProtocolConfig {
  chain: string;
  usr: string;
  stUsr: string;
  usrRequestManager: string;
  rlp: string;
  rlpRequestManager: string;
  birthblock: number;
}

export const ResolvConfigs: ResolvProtocolConfig = {
  protocol: ProtocolNames.resolv,
  birthday: 1727740800, // Tue Oct 01 2024 00:00:00 GMT+0000
  birthblock: 20862414, // usrRequestManager and rlpRequestManager are deployed
  chain: ChainNames.ethereum,
  usr: '0x66a1e37c9b0eaddca17d3662d6c05f4decf3e110',
  stUsr: '0x6c8984bc7DBBeDAf4F6b2FD766f16eBB7d10AAb4',
  usrRequestManager: '0x1de327c23ed8f52f797d55b31abce98cb46c8ea9',
  rlp: '0x4956b52aE2fF65D74CA2d61207523288e4528f96',
  rlpRequestManager: '0x10f4d4EAd6Bcd4de7849898403d88528e3Dfc872',
};
