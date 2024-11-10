import { normalizeAddress } from '../../lib/utils';
import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const MantleNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.mantleNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1687996800, // Thu Jun 29 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.mantle,
  optimismPortal: '0xc54cb22944f2be476e02decfcd7e3e7d3e15a8fb',
  optimismGateway: '0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012',
  supportedTokens: OptimismSuperchainTokens,
};

export interface MethProtocolConfig extends ProtocolConfig {
  chain: string;
  mETH: string; // mETH token address
  cmETHVault: string;
  cmETHBirthday: number;
}

export const MethConfigs: MethProtocolConfig = {
  protocol: ProtocolNames.meth,
  category: ProtocolCategories.liquidStaking,
  birthday: 1696636800, // Sat Oct 07 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  mETH: normalizeAddress('0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa'),
  cmETHVault: '0x33272D40b247c4cd9C646582C9bbAD44e85D4fE4',
  cmETHBirthday: 1722643200, // Sat Aug 03 2024 00:00:00 GMT+0000
};
