// dexes protocols like Uniswap, Sushi, ... have multiple pool contracts
// which take time to query event logs
// to save time, we group all dexes protocols into this module: dexscan
// dexscan will query blocks and update multiple protocols data at one time

import { UniswapConfigs, UniswapProtocolConfig } from './protocols/uniswap';

export interface DexscanModuleConfig {
  protocolConfigs: Array<UniswapProtocolConfig>;
}

export const DexscanConfigs: DexscanModuleConfig = {
  protocolConfigs: [UniswapConfigs],
};
