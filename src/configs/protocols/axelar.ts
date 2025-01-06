import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface AxelarGatewayConfig {
  chain: string;
  axelarChainId: string;
  birthday: number;
  gateway: string;
}

export interface AxelarProtocolConfig extends ProtocolConfig {
  dataApiEndpoint: string;
  gateways: Array<AxelarGatewayConfig>;
}

export const AxelarConfigs: AxelarProtocolConfig = {
  protocol: ProtocolNames.axelar,
  birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
  dataApiEndpoint: 'https://axelar-mainnet.s3.us-east-2.amazonaws.com/configs/mainnet-config-1.x.json',
  gateways: [
    {
      chain: ChainNames.ethereum,
      axelarChainId: 'ethereum',
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      gateway: '0x4F4495243837681061C4743b74B3eEdf548D56A5',
    },
    {
      chain: ChainNames.arbitrum,
      axelarChainId: 'arbitrum',
      birthday: 1669852800, // Thu Dec 01 2022 00:00:00 GMT+0000
      gateway: '0xe432150cce91c13a887f7D836923d5597adD8E31',
    },
    {
      chain: ChainNames.avalanche,
      axelarChainId: 'avalanche',
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      gateway: '0x5029C0EFf6C34351a0CEc334542cDb22c7928f78',
    },
    {
      chain: ChainNames.base,
      axelarChainId: 'base',
      birthday: 1689984000, // Sat Jul 22 2023 00:00:00 GMT+0000
      gateway: '0xe432150cce91c13a887f7D836923d5597adD8E31',
    },
    {
      chain: ChainNames.bnbchain,
      axelarChainId: 'binance',
      birthday: 1656633600, // Fri Jul 01 2022 00:00:00 GMT+0000
      gateway: '0x304acf330bbE08d1e512eefaa92F6a57871fD895',
    },
    {
      chain: ChainNames.blast,
      axelarChainId: 'blast',
      birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
      gateway: '0x98B2920D53612483F91F12Ed7754E51b4A77919e',
    },
    {
      chain: ChainNames.celo,
      axelarChainId: 'celo',
      birthday: 1669852800, // Thu Dec 01 2022 00:00:00 GMT+0000
      gateway: '0xe432150cce91c13a887f7D836923d5597adD8E31',
    },
    {
      chain: ChainNames.fantom,
      axelarChainId: 'fantom',
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      gateway: '0x304acf330bbE08d1e512eefaa92F6a57871fD895',
    },
    {
      chain: ChainNames.fraxtal,
      axelarChainId: 'fraxtal',
      birthday: 1708473600, // Wed Feb 21 2024 00:00:00 GMT+0000
      gateway: '0xe432150cce91c13a887f7D836923d5597adD8E31',
    },
    {
      chain: ChainNames.kava,
      axelarChainId: 'kava',
      birthday: 1671062400, // Thu Dec 15 2022 00:00:00 GMT+0000
      gateway: '0xe432150cce91c13a887f7D836923d5597adD8E31',
    },
    {
      chain: ChainNames.linea,
      axelarChainId: 'linea',
      birthday: 1689984000, // Sat Jul 22 2023 00:00:00 GMT+0000
      gateway: '0xe432150cce91c13a887f7D836923d5597adD8E31',
    },
    // {
    //   chain: ChainNames.mantle,
    //   axelarChainId: 'mantle',
    //   birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
    //   gateway: '0xe432150cce91c13a887f7D836923d5597adD8E31',
    // },
    {
      chain: ChainNames.moonbeam,
      axelarChainId: 'moonbeam',
      birthday: 1642636800, // Thu Jan 20 2022 00:00:00 GMT+0000
      gateway: '0x4F4495243837681061C4743b74B3eEdf548D56A5',
    },
    {
      chain: ChainNames.optimism,
      axelarChainId: 'optimism',
      birthday: 1686355200, // Sat Jun 10 2023 00:00:00 GMT+0000
      gateway: '0xe432150cce91c13a887f7D836923d5597adD8E31',
    },
    {
      chain: ChainNames.polygon,
      axelarChainId: 'polygon',
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      gateway: '0x6f015F16De9fC8791b234eF68D486d2bF203FBA8',
    },
    {
      chain: ChainNames.scroll,
      axelarChainId: 'scroll',
      birthday: 1697587200, // Wed Oct 18 2023 00:00:00 GMT+0000
      gateway: '0xe432150cce91c13a887f7D836923d5597adD8E31',
    },
  ],
};
