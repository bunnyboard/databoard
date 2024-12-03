import { ProtocolConfig, Token } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import HyphenSupportedTokens from '../data/constants/HyphenTokens.json';

export interface HyphenLiquidityPoolConfig {
  chain: string;
  liquidityPool: string;
  liquidityProviders: string;
  birthday: number;
  tokens: Array<Token>;
}

export interface HyphenProtocolConfig extends ProtocolConfig {
  liquidityPools: Array<HyphenLiquidityPoolConfig>;
}

export const HyphenConfigs: HyphenProtocolConfig = {
  protocol: ProtocolNames.hyphen,
  birthday: 1647129600, // Sun Mar 13 2022 00:00:00 GMT+0000
  liquidityPools: [
    {
      chain: ChainNames.ethereum,
      birthday: 1647129600, // Sun Mar 13 2022 00:00:00 GMT+0000
      liquidityPool: '0x2A5c2568b10A0E826BfA892Cf21BA7218310180b',
      liquidityProviders: '0xebaB24F13de55789eC1F3fFe99A285754e15F7b9',
      tokens: HyphenSupportedTokens.filter((token) => token.chain === ChainNames.ethereum),
    },
    {
      chain: ChainNames.polygon,
      birthday: 1647129600, // Sun Mar 13 2022 00:00:00 GMT+0000
      liquidityPool: '0x2A5c2568b10A0E826BfA892Cf21BA7218310180b',
      liquidityProviders: '0xebaB24F13de55789eC1F3fFe99A285754e15F7b9',
      tokens: HyphenSupportedTokens.filter((token) => token.chain === ChainNames.polygon),
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1647129600, // Sun Mar 13 2022 00:00:00 GMT+0000
      liquidityPool: '0x2A5c2568b10A0E826BfA892Cf21BA7218310180b',
      liquidityProviders: '0xebaB24F13de55789eC1F3fFe99A285754e15F7b9',
      tokens: HyphenSupportedTokens.filter((token) => token.chain === ChainNames.avalanche),
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1651622400, // Wed May 04 2022 00:00:00 GMT+0000
      liquidityPool: '0x94D3E62151B12A12A4976F60EdC18459538FaF08',
      liquidityProviders: '0x279ac60785a2fcb85550eb243b9a42a543171cc7',
      tokens: HyphenSupportedTokens.filter((token) => token.chain === ChainNames.bnbchain),
    },
    {
      chain: ChainNames.optimism,
      birthday: 1655164800, // Tue Jun 14 2022 00:00:00 GMT+0000
      liquidityPool: '0x856cb5c3cbbe9e2e21293a644aa1f9363cee11e8',
      liquidityProviders: '0xb4778f5aefeb4605ed96e893417271d4a55e32ee',
      tokens: HyphenSupportedTokens.filter((token) => token.chain === ChainNames.optimism),
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1656633600, // Fri Jul 01 2022 00:00:00 GMT+0000
      liquidityPool: '0x856cb5c3cbbe9e2e21293a644aa1f9363cee11e8',
      liquidityProviders: '0xb4778f5aefeb4605ed96e893417271d4a55e32ee',
      tokens: HyphenSupportedTokens.filter((token) => token.chain === ChainNames.arbitrum),
    },
    {
      chain: ChainNames.fantom,
      birthday: 1659398400, // Tue Aug 02 2022 00:00:00 GMT+0000
      liquidityPool: '0x856cb5c3cBBe9e2E21293A644aA1f9363CEE11E8',
      liquidityProviders: '0xb4778f5aeFEb4605Ed96E893417271d4A55E32eE',
      tokens: HyphenSupportedTokens.filter((token) => token.chain === ChainNames.fantom),
    },
  ],
};
