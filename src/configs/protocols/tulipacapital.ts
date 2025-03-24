import { ChainNames, ProtocolNames } from '../names';
import { GauntletProtocolConfig } from './gauntlet';

export const TulipacapitalConfigs: GauntletProtocolConfig = {
  protocol: ProtocolNames.tulipacapital,
  birthday: 1736294400, // Wed Jan 08 2025 00:00:00 GMT+0000
  curators: [
    {
      chain: ChainNames.ethereum,
      birthday: 1736294400, // Wed Jan 08 2025 00:00:00 GMT+0000
      morphoVaults: [],
      eulerVaults: ['0x3b028b4b6c567eF5f8Ca1144Da4FbaA0D973F228', '0x6707Fe1A8a2F9B8a10441778ac6F6Be2Ed991aE7'],
    },
    {
      chain: ChainNames.bob,
      birthday: 1740787200, // Sat Mar 01 2025 00:00:00 GMT+0000
      morphoVaults: [],
      eulerVaults: [
        '0x1A681ED31eA68455A73D187929973e7095c31932',
        '0xced95f4cF51dE12F0a0af62F1b53828491d21Ca9',
        '0xa61837d6745De6198456165191298075Eca0b9a0',
      ],
    },
    {
      chain: ChainNames.berachain,
      birthday: 1739318400, // Wed Feb 12 2025 00:00:00 GMT+0000
      morphoVaults: [],
      eulerVaults: [
        '0x16C7169421CfB2C78b2D447b9274c61B8b2E846a',
        '0x027DcAfB223f69d41Bd413C50854017718419585',
        '0xE932da5A4d00536c224f8153f299cDcD8054c444',
        '0x4f652B92a8CD9e251Db4d43b2073F689E94B4Dba',
        '0xac0476A04c567EBcd49Db0A5b8b294A119d7849D',
        '0x542B1ffd33C239C7AFc6511FB8855390Aa9c8aC2',
        '0xCaa70d2aa873Ef057980844e18D9a9560bdfFcC0',
      ],
    },
  ],
};
