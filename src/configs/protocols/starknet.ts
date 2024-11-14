import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface StarknetNativeBridgeConfig extends ProtocolConfig {
  // layer 1 chain
  chain: string;

  // layer 2 chain
  layer2Chain: string;

  bridges: Array<{
    birthday: number;
    bridge: string;
  }>;
  tokens: Array<string>;
}

export const StarknetNativeBridgeConfigs: StarknetNativeBridgeConfig = {
  protocol: ProtocolNames.starknetNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1647907200, // Tue Mar 22 2022 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.starknet,
  bridges: [
    {
      birthday: 1647907200, // Tue Mar 22 2022 00:00:00 GMT+0000
      bridge: '0xae0Ee0A63A2cE6BaeEFFE56e7714FB4EFE48D419',
    },
    {
      birthday: 1704931200, // Thu Jan 11 2024 00:00:00 GMT+0000
      bridge: '0xcE5485Cfb26914C5dcE00B9BAF0580364daFC7a4',
    },
    {
      birthday: 1657152000, // Thu Jul 07 2022 00:00:00 GMT+0000
      bridge: '0x283751A21eafBFcD52297820D27C1f1963D9b5b4',
    },
    {
      birthday: 1657152000, // Thu Jul 07 2022 00:00:00 GMT+0000
      bridge: '0xF6080D9fbEEbcd44D89aFfBFd42F098cbFf92816',
    },
    {
      birthday: 1657152000, // Thu Jul 07 2022 00:00:00 GMT+0000
      bridge: '0xbb3400F107804DFB482565FF1Ec8D8aE66747605',
    },
    {
      birthday: 1705968000, // Tue Jan 23 2024 00:00:00 GMT+0000
      bridge: '0xCA14057f85F2662257fd2637FdEc558626bCe554',
    },
    {
      birthday: 1666483200, // Sun Oct 23 2022 00:00:00 GMT+0000
      bridge: '0x9F96fE0633eE838D0298E8b8980E6716bE81388d',
    },
    {
      birthday: 1685577600, // Thu Jun 01 2023 00:00:00 GMT+0000
      bridge: '0xBf67F59D2988A46FBFF7ed79A621778a3Cd3985B',
    },
    {
      birthday: 1685923200, // Mon Jun 05 2023 00:00:00 GMT+0000
      bridge: '0xcf58536D6Fab5E59B654228a5a4ed89b13A876C2',
    },
    {
      birthday: 1685923200, // Mon Jun 05 2023 00:00:00 GMT+0000
      bridge: '0xF5b6Ee2CAEb6769659f6C091D209DfdCaF3F69Eb',
    },
    {
      birthday: 1707350400, // Thu Feb 08 2024 00:00:00 GMT+0000
      bridge: '0xF5b6Ee2CAEb6769659f6C091D209DfdCaF3F69Eb',
    },
  ],
  tokens: [
    '0x0000000000000000000000000000000000455448',
    '0xCa14007Eff0dB1f8135f4C25B34De49AB0d42766',
    '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
    '0xae78736Cd615f374D3085123A210448E74Fc6393',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    // '0x04c46e830bb56ce22735d5d8fc9cb90309317d0f',
    // '0x610dbd98a28ebba525e9926b6aaf88f9159edbfd',
    // '0xb2606492712D311be8f41d940AFE8CE742A52D44',
    '0x582d872A1B094FC48F5DE31D3B73F2D9bE47def1',
    '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    '0xaea46A60368A7bD060eec7DF8CBa43b7EF41Ad85',
    '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6',
    '0x4c9EDD5852cd905f086C759E8383e09bff1E68B3',
    '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
    '0xA0b73E1Ff0B80914AB6fe0444E65848C4C34450b',
    '0x6De037ef9aD2725EB40118Bb1702EBb27e4Aeb24',
    '0x3c3a81e81dc49A522A592e7622A7E711c06bf354',
    '0x4E15361FD6b4BB609Fa63C81A2be19d873717870',
    '0xc944E90C64B2c07662A292be6244BDf05Cda44a7',
    '0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa',
    '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
    '0xB0fFa8000886e57F86dd5264b9582b2Ad87b2b91',
    '0x62D0A8458eD7719FDAF978fe5929C6D342B0bFcE',
    '0x6985884C4392D348587B19cb9eAAf157F13271cd',
    '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
    '0x5283D291DBCF85356A21bA090E6db59121208b44',
    '0x5aFE3855358E112B5647B952709E6165e1c1eEEe',
    '0xc00e94Cb662C3520282E6f5717214004A7f26888',
  ],
};
