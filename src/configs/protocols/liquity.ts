import { ProtocolConfig, Token } from '../../types/base';
import { AddressZero } from '../constants';
import { ChainNames, ProtocolNames } from '../names';
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
