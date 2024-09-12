import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface LidoProtocolConfig extends ProtocolConfig {
  chain: string;
  stETH: string;
  legacyOracle: string;
  withdrawalQueue: string;
  upgradeV2Timestamp: number;
}

export const LidoConfigs: LidoProtocolConfig = {
  protocol: ProtocolNames.lido,
  category: ProtocolCategories.liquidStaking,
  birthday: 1608249600, // Fri Dec 18 2020 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  stETH: '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  legacyOracle: '0x442af784A788A5bd6F42A01Ebe9F287a871243fb',
  withdrawalQueue: '0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1',

  // when TokenRebased event is available on stETH contract
  // https://docs.lido.fi/contracts/legacy-oracle
  upgradeV2Timestamp: 1683072000, // Wed May 03 2023 00:00:00 GMT+0000
};
