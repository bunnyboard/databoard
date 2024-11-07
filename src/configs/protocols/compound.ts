import { ProtocolCategories, ProtocolConfig, Token } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface ComptrollerConfig {
  chain: string;

  // market name id
  marketName: string;

  // comptroller conrtact address
  comptroller: string;

  // where market was deployed
  birthday: number;

  // can get token price from on-chain oracle or external source
  oracleSource: 'oracleUsd' | 'oracleEth' | 'external';

  cTokenMappings?: {
    // contract address => underlying token
    [key: string]: Token;
  };

  // we can get all cTokens from Comptroller contract
  // however, the old version of Comptroller didn't support it
  // in that case, we use this cTokens list instead,
  preDefinedMarkets?: Array<string>;

  // underlying or cToken to ignore
  blacklists?: Array<string>;
}

// compound v3
export interface CometConfig {
  chain: string;

  comet: string;

  // where market was deployed
  birthday: number;
}

export interface CompoundProtocolConfig extends ProtocolConfig {
  comptrollers: Array<ComptrollerConfig>;
  comets?: Array<CometConfig>;
}

export const CompoundConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.compound,
  category: ProtocolCategories.lending,
  birthday: 1557273600, // Wed May 08 2019 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.ethereum,
      marketName: 'Core Market',
      birthday: 1557273600, // Wed May 08 2019 00:00:00 GMT+0000
      comptroller: '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
      oracleSource: 'external',
      cTokenMappings: {
        '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5': {
          chain: 'ethereum',
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'ETH',
          decimals: 18,
        },
      },
      preDefinedMarkets: [
        '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
        '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
        '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
        '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1',
        '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
        '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
        '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4',
        '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407',
        '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC',
      ],
    },
  ],
  comets: [
    {
      chain: ChainNames.ethereum,
      birthday: 1660435200, // Sun Aug 14 2022 00:00:00 GMT+0000
      comet: '0xc3d688b66703497daa19211eedff47f25384cdc3',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1673654400, // Sat Jan 14 2023 00:00:00 GMT+0000
      comet: '0xA17581A9E3356d9A858b789D68B4d866e593aE94',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1719619200, // Sat Jun 29 2024 00:00:00 GMT+0000
      comet: '0x3afdc9bca9213a35503b077a6072f3d0d5ab0840',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1725580800, // Fri Sep 06 2024 00:00:00 GMT+0000
      comet: '0x3D0bb1ccaB520A66e607822fC55BC921738fAFE3',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1729209600, // Fri Oct 18 2024 00:00:00 GMT+0000
      comet: '0x5D409e56D886231aDAf00c8775665AD0f9897b56',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1676764800, // Sun Feb 19 2023 00:00:00 GMT+0000
      comet: '0xF25212E676D1F7F89Cd72fFEe66158f541246445',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1719100800, // Sun Jun 23 2024 00:00:00 GMT+0000
      comet: '0xaeb318360f27748acb200ce616e389a6c9409a07',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1683244800, // Fri May 05 2023 00:00:00 GMT+0000
      comet: '0xA5EDBDD9646f8dFF606d7448e414884C7d905dCA',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1692230400, // Thu Aug 17 2023 00:00:00 GMT+0000
      comet: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1717804800, // Sat Jun 08 2024 00:00:00 GMT+0000
      comet: '0x6f7d514bbd4aff3bcd1140b7344b32f063dee486',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1718928000, // Fri Jun 21 2024 00:00:00 GMT+0000
      comet: '0xd98be00b5d27fc98112bde293e487f8d4ca57d07',
    },
    {
      chain: ChainNames.base,
      birthday: 1691193600, // Sat Aug 05 2023 00:00:00 GMT+0000
      comet: '0x9c4ec768c28520B50860ea7a15bd7213a9fF58bf',
    },
    {
      chain: ChainNames.base,
      birthday: 1710201600, // Tue Mar 12 2024 00:00:00 GMT+0000
      comet: '0xb125E6687d4313864e53df431d5425969c15Eb2F',
    },
    {
      chain: ChainNames.base,
      birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
      comet: '0x46e6b214b524310239732D51387075E0e70970bf',
    },
    {
      chain: ChainNames.base,
      birthday: 1728518400, // Thu Oct 10 2024 00:00:00 GMT+0000
      comet: '0x784efeB622244d2348d4F2522f8860B96fbEcE89',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1708128000, // Sat Feb 17 2024 00:00:00 GMT+0000
      comet: '0xB2f97c1Bd3bf02f5e74d13f02E3e26F93D77CE44',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1712448000, // Sun Apr 07 2024 00:00:00 GMT+0000
      comet: '0x2e44e174f7D53F0212823acC11C01A11d58c5bCB', // cUSDCv3
    },
    {
      chain: ChainNames.optimism,
      birthday: 1716249600, // Tue May 21 2024 00:00:00 GMT+0000
      comet: '0x995e394b8b2437ac8ce61ee0bc610d617962b214', // cUSDTv3
    },
    {
      chain: ChainNames.optimism,
      birthday: 1721088000, // Tue Jul 16 2024 00:00:00 GMT+0000
      comet: '0xe36a30d249f7761327fd973001a32010b521b6fd', // cWETHv3
    },
  ],
};
