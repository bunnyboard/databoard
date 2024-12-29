import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface EthenaProtocolConfig extends ProtocolConfig {
  chain: string;
  USDeToken: string;
  USDeStaking: string;
  ENAToken: string;
  ENAStaking: string;

  mintingV1: string;
  mintingV1Birthblock: number;
  mintingV1Endblock: number;

  mintingV2: string;
  mintingV2Birthblock: number;
}

export const EthenaConfigs: EthenaProtocolConfig = {
  protocol: ProtocolNames.ethena,
  birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  USDeToken: '0x4c9edd5852cd905f086c759e8383e09bff1e68b3',
  USDeStaking: '0x9d39a5de30e57443bff2a8307a4256c8797a3497',
  ENAToken: '0x57e114B691Db790C35207b2e685D4A43181e6061',
  ENAStaking: '0x8bE3460A480c80728a8C4D7a5D5303c85ba7B3b9',

  mintingV1Birthblock: 18571427,
  mintingV1Endblock: 20275210,
  mintingV1: '0x2cc440b721d2cafd6d64908d6d8c4acc57f8afc3',

  mintingV2Birthblock: 20142841,
  mintingV2: '0xe3490297a08d6fC8Da46Edb7B6142E4F461b62D3',
};
