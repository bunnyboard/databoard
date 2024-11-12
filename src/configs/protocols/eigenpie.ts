import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface EigenpieProtocolConfig extends ProtocolConfig {
  chain: string;
  staking: string;
  withdraManager: string;
  tokens: Array<string>;
}

export const EigenpieConfigs: EigenpieProtocolConfig = {
  protocol: ProtocolNames.eigenpie,
  category: ProtocolCategories.liquidStaking,
  birthday: 1706313600, // Sat Jan 27 2024 00:00:00 GMT+0000

  chain: ChainNames.ethereum,
  staking: '0x24db6717db1c75b9db6ea47164d8730b63875db7',
  withdraManager: '0x98083e22d12497c1516d3c49e7cc6cd2cd9dcba4',
  tokens: [
    '0x18f313Fc6Afc9b5FD6f0908c1b3D476E3feA1DD9',
    '0x49446a0874197839d15395b908328a74ccc96bc0',
    '0xd05728038681bcc79b2d5aeb4d9b002e66c93a40',
    '0xE46a5E19B19711332e33F33c2DB3eA143e86Bc10',
    '0x8a053350ca5f9352a16ded26ab333e2d251dad7c',
    '0x879054273cb2dad631980fa4efe6d25eefe08aa4',
    '0xD09124e8a1e3D620E8807aD1d968021A5495CEe8',
    '0x32bd822d615A3658A68b6fDD30c2fcb2C996D678',
    '0x9a1722b1f4A1BB2F271211ade8e851aFc54F77E5',
    '0x352a3144e88D23427993938cfd780291D95eF091',
    '0x5A4A503F4745c06A07E29D9a9DD88aB52f7a505B',
    '0x310718274509a38cc5559a1ff48c5eDbE75a382B',
    '0xa939C02DbA8F237b40d2A3E96AD4252b00Bb8a72',
  ],
};
