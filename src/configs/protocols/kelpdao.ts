import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface KelpdaoRsEthPool {
  chain: string;
  depositPool: string;
}

export interface KelpdaoProtocolConfig extends ProtocolConfig {
  chain: string;
  lrtConfig: string;
  lrtOracle: string;
  lrtDepositPool: string;

  // layer deposit pools
  pools: Array<KelpdaoRsEthPool>;
}

export const KelpdaoConfigs: KelpdaoProtocolConfig = {
  protocol: ProtocolNames.kelpdao,
  birthday: 1702252800, // Mon Dec 11 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  lrtConfig: '0x947Cb49334e6571ccBFEF1f1f1178d8469D65ec7',
  lrtOracle: '0x349A73444b1a310BAe67ef67973022020d70020d',
  lrtDepositPool: '0x036676389e48133B63a802f8635AD39E752D375D',
  pools: [],
};
