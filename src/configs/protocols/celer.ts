import { ProtocolCategories, ProtocolConfig, Token } from '../../types/base';
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
  category: ProtocolCategories.bridge,
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
  ],
};
