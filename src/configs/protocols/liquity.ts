import { ProtocolConfig, Token } from '../../types/base';
import { AddressZero } from '../constants';
import { ChainNames, ProtocolNames } from '../names';

export interface Liquityv2ProtocolConfig extends ProtocolConfig {
  chain: string;
  stablecoin: Token;
  collateralRegistry: string;
}

export interface LiquityProtocolConfig extends ProtocolConfig {
  chain: string;
  stablecoin: Token;
  collateral: Token;
  borrowOperations: string;
  troveManager: string;
}

export const LiquityConfigs: LiquityProtocolConfig = {
  protocol: ProtocolNames.liquity,
  birthday: 1617667200, // Tue Apr 06 2021 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  stablecoin: {
    chain: 'ethereum',
    symbol: 'LUSD',
    decimals: 18,
    address: '0x5f98805a4e8be255a32880fdec7f6728c6568ba0',
  },
  borrowOperations: '0x24179cd81c9e782a4096035f7ec97fb8b783e007',
  troveManager: '0xa39739ef8b0231dbfa0dcda07d7e29faabcf4bb2',
  collateral: {
    chain: 'ethereum',
    symbol: 'ETH',
    decimals: 18,
    address: AddressZero,
  },
};

export const Liquityv2Configs: Liquityv2ProtocolConfig = {
  protocol: ProtocolNames.liquityv2,
  birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  stablecoin: {
    chain: 'ethereum',
    symbol: 'BOLD',
    decimals: 18,
    address: '0xb01dd87b29d187f3e3a4bf6cdaebfb97f3d9ab98',
  },
  collateralRegistry: '0xd99de73b95236f69a559117ecd6f519af780f3f7',
};
