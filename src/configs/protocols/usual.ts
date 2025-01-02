import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface UsualProtocolConfig extends ProtocolConfig {
  chain: string;
  usd0: string;
  usd0Staking: string;
  usual: string;
  usualStaking: string;
  treasury: string;
  daoCollateral: string;
  usualDistribution: string;
  collaterals: Array<string>;
}

export const UsualConfigs: UsualProtocolConfig = {
  protocol: ProtocolNames.usual,
  birthday: 1716508800, // Fri May 24 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  usd0: '0x73A15FeD60Bf67631dC6cd7Bc5B6e8da8190aCF5',
  usd0Staking: '0x35D8949372D46B7a3D5A56006AE77B215fc69bC0',
  usual: '0xC4441c2BE5d8fA8126822B9929CA0b81Ea0DE38E',
  usualStaking: '0x06B964d96f5dCF7Eae9d7C559B09EDCe244d4B8E',
  treasury: '0xdd82875f0840AAD58a455A70B88eEd9F59ceC7c7',
  daoCollateral: '0xde6e1F680C4816446C8D515989E2358636A38b04',
  usualDistribution: '0x75cC0C0DDD2Ccafe6EC415bE686267588011E36A',
  collaterals: [
    '0x136471a34f6ef19fe571effc1ca711fdb8e49f2b', // USYC
    '0x4cbc25559dbbd1272ec5b64c7b5f48a2405e6470', // M^0 - USUALM
  ],
};
