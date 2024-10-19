import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SynapseLiquidityPool {
  address: string;
  tokens: Array<string>;
}

export interface SynapseBridgeConfig {
  chain: string;
  birthday: number;

  // the synapse bridge contract
  bridge?: string;

  // count total assets locked in bridge contracts
  bridgeTokens?: Array<string>;

  // the synapse rfq bridge
  fastBridgeRfq?: string;

  // list of liquidity pools if any
  liquidityPools?: Array<SynapseLiquidityPool>;
}

export interface SynapseProtocolConfig extends ProtocolConfig {
  bridges: Array<SynapseBridgeConfig>;
}

export const SynapseConfigs: SynapseProtocolConfig = {
  protocol: ProtocolNames.synapse,
  category: ProtocolCategories.bridge,
  birthday: 1629158400, // Tue Aug 17 2021 00:00:00 GMT+0000
  bridges: [
    {
      chain: ChainNames.ethereum,
      birthday: 1629158400, // Tue Aug 17 2021 00:00:00 GMT+0000
      bridge: '0x2796317b0fF8538F253012862c06787Adfb8cEb6',
      bridgeTokens: [
        '0x98585dfc8d9e7d48f0b1ae47ce33332cf4237d96',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0x0ab87046fBb341D058F17CBC4c1133F25a20a52f',
        '0x71ab77b7dbb4fa7e017bc15090b2163221420282',
        '0x853d955acef822db058eb8505911ed77f175b99e',
        '0xbaac2b4491727d78d2b78815144570b9f2fe8899',
        '0x73968b9a57c6e53d41345fd57a6e6ae27d6cdb2f',
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0xb753428af26e81097e7fd17f40c88aaa3e04902c',
        '0x6b175474e89094c44da98b954eedeac495271d0f',
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
        '0x0642026E7f0B6cCaC5925b4E7Fa61384250e1701',
      ],
      // bridgeSupportedTokens: [
      //   AddressZero, // native token
      //   '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8',
      //   '0x6b175474e89094c44da98b954eedeac495271d0f',
      //   '0xBAac2B4491727D78D2b78815144570b9f2Fe8899',
      //   '0x853d955acef822db058eb8505911ed77f175b99e',
      //   '0x0ab87046fBb341D058F17CBC4c1133F25a20a52f',
      //   '0x0642026e7f0b6ccac5925b4e7fa61384250e1701',
      //   '0x12f79f8c1A6e47a9b5F0796FDb008Bdc182fa19e',
      //   '0x514910771af9ca656af840dff83e8264ecf986ca',
      //   '0x98585dFc8d9e7D48F0b1aE47ce33332CF4237D96',
      //   '0x1B84765dE8B7566e4cEAF4D0fD3c5aF52D3DdE4F',
      //   '0x6982508145454ce325ddbe47a25d4ec3d2311933',
      // ],
      fastBridgeRfq: '0x5523d3c98809dddb82c686e152f5c58b1b0fb59e',
      liquidityPools: [
        {
          address: '0x1116898dda4015ed8ddefb84b6e8bc24528af2d8',
          tokens: [
            '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            '0xdac17f958d2ee523a2206206994597c13d831ec7',
            '0x6b175474e89094c44da98b954eedeac495271d0f',
          ],
        },
      ],
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1631491200, // Mon Sep 13 2021 00:00:00 GMT+0000
      bridge: '0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9',
      fastBridgeRfq: '0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E',
      bridgeTokens: ['0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a'],
      liquidityPools: [
        {
          address: '0xa067668661C84476aFcDc6fA5D758C4c01C34352',
          tokens: ['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
        },
        {
          address: '0x9Dd329F5411466d9e0C488fF72519CA9fEf0cb40',
          tokens: ['0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'],
        },
        {
          address: '0x0Db3FE3B770c95A0B99D1Ed6F2627933466c0Dd8',
          tokens: [
            '0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a',
            '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
            '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
          ],
        },
      ],
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1629936000, // Thu Aug 26 2021 00:00:00 GMT+0000
      bridge: '0xC05e61d0E7a63D27546389B7aD62FdFf5A91aACE',
      bridgeTokens: [
        '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
        '0x1f1e7c893855525b303f99bdf5c3c05be09ca251',
        '0x321E7092a180BB43555132ec53AaA65a5bF84251',
        '0x152b9d0FdC40C096757F570A51E494bd4b943E50',
        '0x62edc0692BD897D2295872a9FFCac5425011c661',
      ],
      liquidityPools: [
        {
          address: '0xED2a7edd7413021d440b09D654f3b87712abAB66',
          tokens: [
            '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
            '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
            '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
          ],
        },
      ],
    },
    {
      chain: ChainNames.base,
      birthday: 1690934400, // Wed Aug 02 2023 00:00:00 GMT+0000
      bridge: '0xf07d1C752fAb503E47FEF309bf14fbDD3E867089',
      fastBridgeRfq: '0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E',
      liquidityPools: [
        {
          address: '0x6223bD82010E2fB69F329933De20897e7a4C225f',
          tokens: ['0x4200000000000000000000000000000000000006'],
        },
      ],
    },
    {
      chain: ChainNames.blast,
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      bridge: '0x55769baf6ec39b3bf4aae948eb890ea33307ef3c',
      fastBridgeRfq: '0x34F52752975222d5994C206cE08C1d5B329f24dD',
      liquidityPools: [
        {
          address: '0xa4bd1AAD7cF04567c10f38FC4355E91bba32aC9c',
          tokens: ['0x4300000000000000000000000000000000000003'],
        },
        {
          address: '0x999fcd13C54B26E02a6Ccd185f71550b3a4641c0',
          tokens: ['0x4300000000000000000000000000000000000004'],
        },
      ],
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1629158400, // Tue Aug 17 2021 00:00:00 GMT+0000
      bridge: '0xd123f70AE324d34A9E76b67a27bf77593bA8749f',
      fastBridgeRfq: '0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E',
      bridgeTokens: [
        '0x5f4bde007dc06b867f86ebfe4802e34a1ffeed63',
        '0xaA88C603d142C371eA0eAC8756123c5805EdeE03',
        '0xe9e7cea3dedca5984780bafc599bd69add087d56',
      ],
      liquidityPools: [
        {
          address: '0x28ec0B36F0819ecB5005cAB836F4ED5a2eCa4D13',
          tokens: [
            '0xe9e7cea3dedca5984780bafc599bd69add087d56',
            '0x55d398326f99059ff775485246999027b3197955',
            '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
          ],
        },
      ],
    },
    {
      chain: ChainNames.cronos,
      birthday: 1645401600, // Mon Feb 21 2022 00:00:00 GMT+0000
      bridge: '0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9',
      liquidityPools: [
        {
          address: '0xCb6674548586F20ca39C97A52A0ded86f48814De',
          tokens: ['0xc21223249ca28397b4b6541dffaecc539bff0c59'],
        },
      ],
    },
    {
      chain: ChainNames.fantom,
      birthday: 1633651200, // Fri Oct 08 2021 00:00:00 GMT+0000
      bridge: '0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b',
      bridgeTokens: [
        '0x91fa20244Fb509e8289CA630E5db3E9166233FDc',
        '0x6Fc9383486c163fA48becdEC79d6058f984f62cA',
        '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
      ],
      liquidityPools: [
        {
          address: '0x85662fd123280827e11c59973ac9fcbe838dc3b4',
          tokens: ['0x049d68029688eabf473097a2fc38ef61633a3c7a', '0x04068da6c83afcfa0e13ba15a6696662335d5b75'],
        },
        {
          address: '0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1',
          tokens: ['0x74b23882a30290451A17c44f4F05243b6b58C76d'],
        },
      ],
    },
    {
      chain: ChainNames.kaia,
      birthday: 1655596800, // Sun Jun 19 2022 00:00:00 GMT+0000
      bridge: '0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b',
      bridgeTokens: [
        '0x5819b6af194a78511c79c85ea68d2377a7e9335f',
        '0xcd6f29dc9ca217d0973d3d21bf58edd3ca871a86',
        '0xd6dab4cff47df175349e6e7ee2bf7c40bb8c05a3', // USDT
        '0x6270b58be569a7c0b8f47594f191631ae5b2c86c', // USDC
        '0xdcbacf3f7a069922e677912998c8d57423c37dfa', // WBTC
      ],
      liquidityPools: [
        {
          address: '0xfdbad1699a550f933efebf652a735f2f89d3833c',
          tokens: ['0xd6dab4cff47df175349e6e7ee2bf7c40bb8c05a3', '0xcee8faf64bb97a73bb51e115aa89c17ffa8dd167'],
        },
      ],
    },
    {
      chain: ChainNames.metis,
      birthday: 1646006400, // Mon Feb 28 2022 00:00:00 GMT+0000
      bridge: '0x06Fea8513FF03a0d3f61324da709D4cf06F42A5c',
      liquidityPools: [
        {
          address: '0x09fec30669d63a13c666d2129230dd5588e2e240',
          tokens: ['0x420000000000000000000000000000000000000a'],
        },
        {
          address: '0x555982d2E211745b96736665e19D9308B615F78e',
          tokens: ['0xEA32A96608495e54156Ae48931A7c20f0dcc1a21'],
        },
      ],
    },
    {
      chain: ChainNames.moonbeam,
      birthday: 1641945600, // Wed Jan 12 2022 00:00:00 GMT+0000
      bridge: '0x84A420459cd31C3c34583F67E0f0fB191067D32f',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1636761600, // Sat Nov 13 2021 00:00:00 GMT+0000
      bridge: '0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b',
      fastBridgeRfq: '0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E',
      liquidityPools: [
        {
          address: '0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9',
          tokens: ['0x4200000000000000000000000000000000000006'],
        },
        {
          address: '0xF44938b0125A6662f9536281aD2CD6c499F22004',
          tokens: ['0x7f5c764cbc14f9669b88837ca1490cca17c31607'],
        },
      ],
    },
    {
      chain: ChainNames.polygon,
      birthday: 1629158400, // Tue Aug 17 2021 00:00:00 GMT+0000
      bridge: '0x8F5BBB2BB8c2Ee94639E55d5F41de9b4839C1280',
      bridgeTokens: ['0xd8cA34fd379d9ca3C6Ee3b3905678320F5b45195', '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'],
      liquidityPools: [
        {
          address: '0x85fCD7Dd0a1e1A9FCD5FD886ED522dE8221C3EE5',
          tokens: [
            '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
            '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
            '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
          ],
        },
      ],
    },
    {
      chain: ChainNames.linea,
      birthday: 1721692800, // Tue Jul 23 2024 00:00:00 GMT+0000
      fastBridgeRfq: '0x34F52752975222d5994C206cE08C1d5B329f24dD',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1714089600, // Fri Apr 26 2024 00:00:00 GMT+0000
      fastBridgeRfq: '0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E',
    },
  ],
};
