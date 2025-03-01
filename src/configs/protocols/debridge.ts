import { ProtocolConfig } from '../../types/base';
import { AddressZero } from '../constants';
import { ChainNames, ProtocolNames } from '../names';

export interface DebridgeNetowrkConfig {
  chain: string;
  birthday: number;
  dlnSource: string;
  feeToken: string;
  feeFlatAmount: number;
  tokens: Array<string>;
  blacklistTokens?: Array<string>;
}

export interface DebridgeProtocolConfig extends ProtocolConfig {
  networks: Array<DebridgeNetowrkConfig>;
}

export const DebridgeInternalChanIds: { [key: number]: string } = {
  7565164: ChainNames.solana,
  100000014: ChainNames.sonic,
  100000001: ChainNames.neonevm,
  100000002: ChainNames.gnosis,
  100000004: ChainNames.metis,
  100000010: ChainNames.cronoszkevm,
  100000017: ChainNames.abstract,
  100000020: ChainNames.berachain,
  100000013: ChainNames.story,
};

export const DebridgeConfigs: DebridgeProtocolConfig = {
  protocol: ProtocolNames.debridge,
  birthday: 1694131200, // Fri Sep 08 2023 00:00:00 GMT+0000
  networks: [
    {
      chain: ChainNames.ethereum,
      birthday: 1694131200, // Fri Sep 08 2023 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 0.001,
      tokens: [
        AddressZero,
        '0x004e9c3ef86bc1ca1f0bb5c7662861ee93350568',
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      ],
      blacklistTokens: ['0x9d3d07439069c9bbc8d626397cf98cb343ac0a72'],
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1694131200, // Fri Sep 08 2023 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 0.001,
      tokens: [
        AddressZero,
        '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        '0x912ce59144191c1204e64559fe8253a0e49e6548',
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        '0x17fc002b466eec40dae837fc4be5c67993ddbd6f',
        '0xb0ffa8000886e57f86dd5264b9582b2ad87b2b91',
      ],
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1694131200, // Fri Sep 08 2023 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 0.05,
      tokens: [
        AddressZero,
        '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
        '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
        '0xc7198437980c041c805a1edcba50c1ce5db95118',
        '0x19860ccb0a68fd4213ab9d8266f7bbf05a8dde98',
        '0xd24c2ad096400b6fbcd2ad8b24e7acbc21a1da64',
      ],
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1694131200, // Fri Sep 08 2023 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 0.005,
      tokens: [
        AddressZero,
        '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
        '0x55d398326f99059ff775485246999027b3197955',
        '0xe9e7cea3dedca5984780bafc599bd69add087d56',
        '0xba2ae424d960c26247dd6c32edc70b295c744c43',
        '0xad29abb318791d579433d831ed122afeaf29dcfe',
        '0x570a5d26f7765ecb712c0924e4de545b89fd43df',
        '0xdce07662ca8ebc241316a15b611c89711414dd1a',
        '0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3',
      ],
      blacklistTokens: ['0x5b330fd7ea69d8a6d78722a0297a2c8cdd424352'],
    },
    {
      chain: ChainNames.polygon,
      birthday: 1694131200, // Fri Sep 08 2023 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 0.5,
      tokens: [
        AddressZero,
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        '0xd93f7e271cb87c23aaa73edc008a79646d1f9912',
        '0x45c32fa6df82ead1e2ef74d17b76547eddfaff89',
      ],
      blacklistTokens: ['0xe57594f829b3d514ee12c41e81df3861b19c26e3', '0x71e3071e5561ddee34273f1c5e66daa5f6d0b0b3'],
    },
    {
      chain: ChainNames.linea,
      birthday: 1694131200, // Fri Sep 08 2023 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 0.001,
      tokens: [AddressZero, '0x176211869ca2b568f2a7d4ee941e073a821ee1ff'],
    },
    {
      chain: ChainNames.base,
      birthday: 1694131200, // Fri Sep 08 2023 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 0.001,
      tokens: [
        AddressZero,
        '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
        '0x4200000000000000000000000000000000000006',
        '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22',
      ],
    },
    {
      chain: ChainNames.optimism,
      birthday: 1694131200, // Fri Sep 08 2023 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 0.001,
      tokens: [
        AddressZero,
        '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
        '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
        '0x4200000000000000000000000000000000000042',
        '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
      ],
    },
    {
      chain: ChainNames.gnosis,
      birthday: 1713744000, // Mon Apr 22 2024 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 1,
      tokens: [AddressZero, '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0', '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83'],
    },
    {
      chain: ChainNames.metis,
      birthday: 1714262400, // Sun Apr 28 2024 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 0.02,
      tokens: [AddressZero, '0xeF4fB24aD0916217251F553c0596F8Edc630EB66'],
    },
    {
      chain: ChainNames.sonic,
      birthday: 1734393600, // Tue Dec 17 2024 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 1,
      tokens: [AddressZero, '0x29219dd400f2bf60e5a23d13be72b486d4038894'],
    },
    {
      chain: ChainNames.berachain,
      birthday: 1738713600, // Wed Feb 05 2025 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 0.02,
      tokens: [AddressZero, '0x549943e04f40284185054145c6e4e9568c1d3241'],
    },
    {
      chain: ChainNames.story,
      birthday: 1739059200, // Sun Feb 09 2025 00:00:00 GMT+0000
      dlnSource: '0xeF4fB24aD0916217251F553c0596F8Edc630EB66',
      feeToken: AddressZero,
      feeFlatAmount: 0.01, // IP
      tokens: [AddressZero, '0xf1815bd50389c46847f0bda824ec8da914045d14'],
    },
  ],
};
