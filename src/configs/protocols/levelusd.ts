import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface LevelusdProtocolConfig extends ProtocolConfig {
  chain: string;
  lvlUSD: string;
  slvlUSD: string;
  minting: string;
  lens: string;
}

export const LevelusdConfigs: LevelusdProtocolConfig = {
  protocol: ProtocolNames.levelusd,
  birthday: 1727913600, // Thu Oct 03 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  lvlUSD: '0x7c1156e515aa1a2e851674120074968c905aaf37',
  slvlUSD: '0x4737D9b4592B40d51e110b94c9C043c6654067Ae',
  minting: '0x8e7046e27d14d09bdacde9260ff7c8c2be68a41f',
  lens: '0x29759944834e08acE755dcEA71491413f7e2CBAD',
};
