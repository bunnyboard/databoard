// dexes protocols like Uniswap, Sushi, ... have multiple pool contracts
// which take time to query event logs
// to save time, we group all dexes protocols into this module: dexscan
// dexscan will query blocks and update multiple protocols data at one time

import { TokenBookDexBase } from './data';
import { SpookyConfigs } from './protocols/spooky';
import { SushiConfigs } from './protocols/sushi';
import { UniswapConfigs, UniswapFactoryConfig } from './protocols/uniswap';

export interface DexscanSupportedEvents {
  factory: {
    univ2PairCreated: string;
    univ3PoolCreated: string;
  };
  univ2: {
    Swap: string;
    Mint: string;
    Burn: string;
  };
  univ3: {
    Swap: string;
    Mint: string;
    Burn: string;
  };
  pancakev3: {
    Swap: string;
  };
}

export interface DexscanFactoryConfig extends UniswapFactoryConfig {
  protocol: string;
}

export interface DexscanModuleConfig {
  // block number where UniswapV3Factory was deployed
  univ3Birthblocks: {
    // chain => birthblock
    [key: string]: number;
  };

  // a list of safe base tokens
  baseTokens: {
    // chain => Array<tokenAddresses>
    [key: string]: Array<string>;
  };

  // event filters
  events: DexscanSupportedEvents;

  // a list of factories configs
  factories: Array<DexscanFactoryConfig>;
}

export const DexscanConfigs: DexscanModuleConfig = {
  univ3Birthblocks: {
    ethereum: 12369622,
    arbitrum: 165,
    avalanche: 27832972,
    base: 1371680,
    bnbchain: 26324014,
    optimism: 1,
    polygon: 22757547,
    blast: 400903,
    celo: 13916355,
    zksync: 12637075,
    zora: 10320368,
    fantom: 70992836,
    linea: 1444,
    polygonzkevm: 750149,
    opbnb: 1721753,
    scroll: 82522,
  },
  baseTokens: TokenBookDexBase,
  events: {
    factory: {
      univ2PairCreated: '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9',
      univ3PoolCreated: '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118',
    },
    univ2: {
      Swap: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
      Mint: '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
      Burn: '0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496',
    },
    univ3: {
      Swap: '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67',
      Mint: '0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde',
      Burn: '0x0c396cd989a39f4459b5fa1aed6a9a8dcdbc45908acfd67e028cd568da98982c',
    },
    pancakev3: {
      Swap: '0x19b47279256b2a23a1665c810c8d55a1758940ee09377d4f8d26497a3577dc83',
    },
  },
  factories: [
    ...UniswapConfigs.factories.map((factory) => {
      return {
        protocol: UniswapConfigs.protocol,
        ...factory,
      };
    }),
    ...SushiConfigs.factories.map((factory) => {
      return {
        protocol: SushiConfigs.protocol,
        ...factory,
      };
    }),
    ...SpookyConfigs.factories.map((factory) => {
      return {
        protocol: SpookyConfigs.protocol,
        ...factory,
      };
    }),
  ],
};

// group factories configs by chain
export function getDexscanModuleConfigChains(dexscanModuleConfig: DexscanModuleConfig): {
  // chain => Array<DexscanFactoryConfig>
  [key: string]: Array<DexscanFactoryConfig>;
} {
  const chains: { [key: string]: Array<DexscanFactoryConfig> } = {};

  for (const factoryConfig of dexscanModuleConfig.factories) {
    if (!chains[factoryConfig.chain]) {
      chains[factoryConfig.chain] = [];
    }

    chains[factoryConfig.chain].push(factoryConfig);
  }

  return chains;
}
