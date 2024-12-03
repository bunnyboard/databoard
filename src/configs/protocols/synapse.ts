import { ProtocolConfig, Token } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import SynapseSupportedTokens from '../data/constants/SynapseTokens.json';

export interface SynapseLiquidityPool {
  address: string;
  tokens: Array<string>;
}

export interface SynapseBridgeConfig {
  chain: string;
  birthday: number;

  // the synapse bridge contract
  bridge?: string;

  // the synapse rfq bridge
  fastBridgeRfq?: string;

  // list of liquidity pools if any
  liquidityPools?: Array<string>;

  // supported tokens
  tokens: Array<Token>;
}

export interface SynapseProtocolConfig extends ProtocolConfig {
  bridges: Array<SynapseBridgeConfig>;
}

export const SynapseConfigs: SynapseProtocolConfig = {
  protocol: ProtocolNames.synapse,
  birthday: 1629158400, // Tue Aug 17 2021 00:00:00 GMT+0000
  bridges: [
    {
      chain: ChainNames.ethereum,
      birthday: 1629158400, // Tue Aug 17 2021 00:00:00 GMT+0000
      bridge: '0x2796317b0fF8538F253012862c06787Adfb8cEb6',
      fastBridgeRfq: '0x5523d3c98809dddb82c686e152f5c58b1b0fb59e',
      liquidityPools: ['0x1116898dda4015ed8ddefb84b6e8bc24528af2d8'],
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.ethereum),
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1631491200, // Mon Sep 13 2021 00:00:00 GMT+0000
      bridge: '0x6F4e8eBa4D337f874Ab57478AcC2Cb5BACdc19c9',
      fastBridgeRfq: '0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E',
      liquidityPools: [
        '0xa067668661C84476aFcDc6fA5D758C4c01C34352',
        '0x9Dd329F5411466d9e0C488fF72519CA9fEf0cb40',
        '0x0Db3FE3B770c95A0B99D1Ed6F2627933466c0Dd8',
      ],
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.arbitrum),
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1629936000, // Thu Aug 26 2021 00:00:00 GMT+0000
      bridge: '0xC05e61d0E7a63D27546389B7aD62FdFf5A91aACE',
      liquidityPools: ['0xED2a7edd7413021d440b09D654f3b87712abAB66'],
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.avalanche),
    },
    {
      chain: ChainNames.base,
      birthday: 1690934400, // Wed Aug 02 2023 00:00:00 GMT+0000
      bridge: '0xf07d1C752fAb503E47FEF309bf14fbDD3E867089',
      fastBridgeRfq: '0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E',
      liquidityPools: ['0x6223bD82010E2fB69F329933De20897e7a4C225f'],
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.base),
    },
    {
      chain: ChainNames.blast,
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      bridge: '0x55769baf6ec39b3bf4aae948eb890ea33307ef3c',
      fastBridgeRfq: '0x34F52752975222d5994C206cE08C1d5B329f24dD',
      liquidityPools: ['0xa4bd1AAD7cF04567c10f38FC4355E91bba32aC9c', '0x999fcd13C54B26E02a6Ccd185f71550b3a4641c0'],
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.blast),
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1629158400, // Tue Aug 17 2021 00:00:00 GMT+0000
      bridge: '0xd123f70AE324d34A9E76b67a27bf77593bA8749f',
      fastBridgeRfq: '0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E',
      liquidityPools: ['0x28ec0B36F0819ecB5005cAB836F4ED5a2eCa4D13'],
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.bnbchain),
    },
    {
      chain: ChainNames.cronos,
      birthday: 1645401600, // Mon Feb 21 2022 00:00:00 GMT+0000
      bridge: '0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9',
      liquidityPools: ['0xCb6674548586F20ca39C97A52A0ded86f48814De'],
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.cronos),
    },
    {
      chain: ChainNames.fantom,
      birthday: 1633651200, // Fri Oct 08 2021 00:00:00 GMT+0000
      bridge: '0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b',
      liquidityPools: ['0x85662fd123280827e11c59973ac9fcbe838dc3b4', '0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1'],
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.fantom),
    },
    {
      chain: ChainNames.kaia,
      birthday: 1655596800, // Sun Jun 19 2022 00:00:00 GMT+0000
      bridge: '0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b',
      liquidityPools: ['0xfdbad1699a550f933efebf652a735f2f89d3833c'],
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.kaia),
    },
    {
      chain: ChainNames.metis,
      birthday: 1646006400, // Mon Feb 28 2022 00:00:00 GMT+0000
      bridge: '0x06Fea8513FF03a0d3f61324da709D4cf06F42A5c',
      liquidityPools: ['0x09fec30669d63a13c666d2129230dd5588e2e240', '0x555982d2E211745b96736665e19D9308B615F78e'],
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.metis),
    },
    {
      chain: ChainNames.moonbeam,
      birthday: 1641945600, // Wed Jan 12 2022 00:00:00 GMT+0000
      bridge: '0x84A420459cd31C3c34583F67E0f0fB191067D32f',
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.moonbeam),
    },
    {
      chain: ChainNames.optimism,
      birthday: 1636761600, // Sat Nov 13 2021 00:00:00 GMT+0000
      bridge: '0xAf41a65F786339e7911F4acDAD6BD49426F2Dc6b',
      fastBridgeRfq: '0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E',
      liquidityPools: ['0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9', '0xF44938b0125A6662f9536281aD2CD6c499F22004'],
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.optimism),
    },
    {
      chain: ChainNames.polygon,
      birthday: 1629158400, // Tue Aug 17 2021 00:00:00 GMT+0000
      bridge: '0x8F5BBB2BB8c2Ee94639E55d5F41de9b4839C1280',
      liquidityPools: ['0x85fCD7Dd0a1e1A9FCD5FD886ED522dE8221C3EE5'],
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.polygon),
    },
    {
      chain: ChainNames.linea,
      birthday: 1721692800, // Tue Jul 23 2024 00:00:00 GMT+0000
      fastBridgeRfq: '0x34F52752975222d5994C206cE08C1d5B329f24dD',
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.linea),
    },
    {
      chain: ChainNames.scroll,
      birthday: 1714089600, // Fri Apr 26 2024 00:00:00 GMT+0000
      fastBridgeRfq: '0x5523D3c98809DdDB82C686E152F5C58B1B0fB59E',
      tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.scroll),
    },
    // {
    //   chain: ChainNames.moonriver,
    //   birthday: 1636761600, // Sat Nov 13 2021 00:00:00 GMT+0000
    //   fastBridgeRfq: '0xaeD5b25BE1c3163c907a471082640450F928DDFE',
    //   tokens: SynapseSupportedTokens.filter((token) => token.chain === ChainNames.moonriver),
    // },
  ],
};
