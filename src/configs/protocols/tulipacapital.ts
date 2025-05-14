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
      eulerVaults: [
        '0x89963076d2aBCf6b3C449A8f0f69439C47C0464d',
        '0xc7d526eFefa2e3073531f9e054F5c8cD1d0eC636',
        '0x53208e965EB66841598fB8f983a41936EeE6d774',
        '0xc1fF5490651B9B8d0400B0146E7fb174B90E315B',
        '0x3b028b4b6c567eF5f8Ca1144Da4FbaA0D973F228',
        '0x6707Fe1A8a2F9B8a10441778ac6F6Be2Ed991aE7',
        '0xDe60b6090570C87d9ED0eF164C381469184758eB',
      ],
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
        '0x07346aE3245E04C96E33E8d8e02a638AaA08E719',
        '0x16C7169421CfB2C78b2D447b9274c61B8b2E846a',
        '0x027DcAfB223f69d41Bd413C50854017718419585',
        '0xE932da5A4d00536c224f8153f299cDcD8054c444',
        '0x4f652B92a8CD9e251Db4d43b2073F689E94B4Dba',
        '0xac0476A04c567EBcd49Db0A5b8b294A119d7849D',
        '0x542B1ffd33C239C7AFc6511FB8855390Aa9c8aC2',
        '0xCaa70d2aa873Ef057980844e18D9a9560bdfFcC0',
      ],
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1744761600, // Wed Apr 16 2025 00:00:00 GMT+0000
      morphoVaults: [],
      eulerVaults: [
        '0x5fd02479F938929F6b9fE1b7Af6430cfD4afa6Aa',
        '0xA9cA5c4bfF689afcFB249AE81565422fa78F82b4',
        '0xfd30377A3173f709d8224Fee7718E312A0868A34',
        '0xa6439FD63C19Cc4893EAcaD20320D11cfd0Ad12C',
        '0xc33c2A5f3c27bcB5559f17ff97A04F281f898f04',
        '0xEcD1F58B9DC4bbC3A32409961B8520B0A8fcd483',
        '0x932FE4797d681a7a82262BC385B534ba069249E1',
      ],
    },
  ],
};
