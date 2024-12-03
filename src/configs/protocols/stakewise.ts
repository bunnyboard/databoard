import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface StakewiseProtocolConfig extends ProtocolConfig {
  chain: string;
  osEth: string;
  osTokenVaultController: string;
  protocolFeeRate: number;

  v1_sETH2: string;
  v1_rETH2: string;
  v1_protocolFeeRate: number;
}

export const StakewiseConfigs: StakewiseProtocolConfig = {
  protocol: ProtocolNames.stakewise,
  birthday: 1698796800, // Wed Nov 01 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,

  osEth: '0xf1C9acDc66974dFB6dEcB12aA385b9cD01190E38',
  osTokenVaultController: '0x2A261e60FB14586B474C208b1B7AC6D0f5000306',

  // https://docs.stakewise.io/protocol-overview-in-depth/fees#ostoken-staking-fee
  protocolFeeRate: 0.05, // 5%

  v1_sETH2: '0xFe2e637202056d30016725477c5da089Ab0A043A',
  v1_rETH2: '0x20BC832ca081b91433ff6c17f85701B6e92486c5',
  v1_protocolFeeRate: 0.1, // 10%
};
