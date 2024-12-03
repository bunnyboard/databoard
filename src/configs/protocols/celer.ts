import { ProtocolConfig, Token } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import CbridgeSupportedTokens from '../data/constants/CbridgeTokens.json';

export interface CbridgeConfig {
  chain: string;
  birthday: number;
  bridge: string;
  originTokenVaultV1?: string;
  originTokenVaultV2?: string;
  tokens: Array<Token>;
}

export interface CbridgeProtocolConfig extends ProtocolConfig {
  bridges: Array<CbridgeConfig>;
}

export const CbridgeConfigs: CbridgeProtocolConfig = {
  protocol: ProtocolNames.cbridge,
  birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
  bridges: [
    {
      chain: ChainNames.ethereum,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      bridge: '0x5427fefa711eff984124bfbb1ab6fbf5e3da1820',
      originTokenVaultV1: '0xB37D31b2A74029B5951a2778F959282E2D518595',
      originTokenVaultV2: '0x7510792a3b1969f9307f3845ce88e39578f2bae1',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.ethereum),
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      bridge: '0x1619DE6B6B20eD217a58d00f37B9d47C7663feca',
      originTokenVaultV1: '0xFe31bFc4f7C9b69246a6dc0087D91a91Cb040f76',
      originTokenVaultV2: '0xEA4B1b0aa3C110c55f650d28159Ce4AD43a4a58b',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.arbitrum),
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      bridge: '0xef3c714c9425a8F3697A9C969Dc1af30ba82e5d4',
      originTokenVaultV1: '0x5427FEFA711Eff984124bFBB1AB6fbf5E3DA1820',
      originTokenVaultV2: '0xb51541df05DE07be38dcfc4a80c05389A54502BB',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.avalanche),
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      bridge: '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF',
      originTokenVaultV1: '0x78bc5Ee9F11d133A08b331C2e18fE81BE0Ed02DC',
      originTokenVaultV2: '0x11a0c9270D88C99e221360BCA50c2f6Fda44A980',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.bnbchain),
    },
    {
      chain: ChainNames.fantom,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      bridge: '0x374B8a9f3eC5eB2D97ECA84Ea27aCa45aa1C57EF',
      originTokenVaultV1: '0x7D91603E79EA89149BAf73C9038c51669D8F03E9',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.fantom),
    },
    {
      chain: ChainNames.gnosis,
      birthday: 1641340800, // Wed Jan 05 2022 00:00:00 GMT+0000
      bridge: '0x3795C36e7D12A8c252A20C5a7B455f7c57b60283',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.gnosis),
    },
    {
      chain: ChainNames.kava,
      birthday: 1654732800, // Thu Jun 09 2022 00:00:00 GMT+0000
      bridge: '0xb51541df05DE07be38dcfc4a80c05389A54502BB',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.kava),
    },
    {
      chain: ChainNames.kaia,
      birthday: 1658793600, // Tue Jul 26 2022 00:00:00 GMT+0000
      bridge: '0x4C882ec256823eE773B25b414d36F92ef58a7c0C',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.kaia),
    },
    {
      chain: ChainNames.linea,
      birthday: 1689379200, // Sat Jul 15 2023 00:00:00 GMT+0000
      bridge: '0x9B36f165baB9ebe611d491180418d8De4b8f3a1f',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.linea),
    },
    {
      chain: ChainNames.metis,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      bridge: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.metis),
    },
    {
      chain: ChainNames.moonbeam,
      birthday: 1642032000, // Thu Jan 13 2022 00:00:00 GMT+0000
      bridge: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.moonbeam),
    },
    {
      chain: ChainNames.optimism,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      bridge: '0x9D39Fc627A6d9d9F8C831c16995b209548cc3401',
      originTokenVaultV1: '0xbCfeF6Bb4597e724D720735d32A9249E0640aA11',
      originTokenVaultV2: '0x6e380ad5D15249eF2DE576E3189fc49B5713BE4f',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.optimism),
    },
    {
      chain: ChainNames.polygon,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      bridge: '0x88DCDC47D2f83a99CF0000FDF667A468bB958a78',
      originTokenVaultV1: '0xc1a2D967DfAa6A10f3461bc21864C23C1DD51EeA',
      originTokenVaultV2: '0x4C882ec256823eE773B25b414d36F92ef58a7c0C',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.polygon),
    },
    {
      chain: ChainNames.polygonzkevm,
      birthday: 1680048000, // Wed Mar 29 2023 00:00:00 GMT+0000
      bridge: '0xD46F8E428A06789B5884df54E029e738277388D1',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.polygonzkevm),
    },
    {
      chain: ChainNames.zksync,
      birthday: 1680307200, // Sat Apr 01 2023 00:00:00 GMT+0000
      bridge: '0x54069e96C4247b37C2fbd9559CA99f08CD1CD66c',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.zksync),
    },
    {
      chain: ChainNames.scroll,
      birthday: 1697760000, // Fri Oct 20 2023 00:00:00 GMT+0000
      bridge: '0x9B36f165baB9ebe611d491180418d8De4b8f3a1f',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.scroll),
    },
    {
      chain: ChainNames.manta,
      birthday: 1694476800, // Tue Sep 12 2023 00:00:00 GMT+0000
      bridge: '0x9B36f165baB9ebe611d491180418d8De4b8f3a1f',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.manta),
    },
    {
      chain: ChainNames.base,
      birthday: 1689638400, // Tue Jul 18 2023 00:00:00 GMT+0000
      bridge: '0x7d43AABC515C356145049227CeE54B608342c0ad',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.base),
    },
    {
      chain: ChainNames.opbnb,
      birthday: 1707436800, // Fri Feb 09 2024 00:00:00 GMT+0000
      bridge: '0xf5C6825015280CdfD0b56903F9F8B5A2233476F5',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.opbnb),
    },
    {
      chain: ChainNames.blast,
      birthday: 1710460800, // Fri Mar 15 2024 00:00:00 GMT+0000
      bridge: '0x841ce48F9446C8E281D3F1444cB859b4A6D0738C',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.blast),
    },
    {
      chain: ChainNames.gravity,
      birthday: 1717804800, // Sat Jun 08 2024 00:00:00 GMT+0000
      bridge: '0x9B36f165baB9ebe611d491180418d8De4b8f3a1f',
      tokens: CbridgeSupportedTokens.filter((token) => token.chain === ChainNames.gravity),
    },
  ],
};
