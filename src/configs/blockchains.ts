import dotenv from 'dotenv';

import { Blockchain } from '../types/configs';
import { AddressZero } from './constants';
import { ChainNames } from './names';

// global env and configurations
dotenv.config();

export const BlockchainConfigs: { [key: string]: Blockchain } = {
  [ChainNames.ethereum]: {
    name: ChainNames.ethereum,
    family: 'evm',
    chainId: 1,
    nodeRpc: String(process.env.BLOCKCHAIN_ETHEREUM_NODE),
    nativeToken: {
      chain: ChainNames.ethereum,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.arbitrum]: {
    name: ChainNames.arbitrum,
    family: 'evm',
    chainId: 42161,
    nodeRpc: String(process.env.BLOCKCHAIN_ARBITRUM_NODE),
    nativeToken: {
      chain: ChainNames.arbitrum,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.base]: {
    name: ChainNames.base,
    family: 'evm',
    chainId: 8453,
    nodeRpc: String(process.env.BLOCKCHAIN_BASE_NODE),
    nativeToken: {
      chain: ChainNames.base,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.optimism]: {
    name: ChainNames.optimism,
    family: 'evm',
    chainId: 10,
    nodeRpc: String(process.env.BLOCKCHAIN_OPTIMISM_NODE),
    nativeToken: {
      chain: ChainNames.optimism,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.polygon]: {
    name: ChainNames.polygon,
    family: 'evm',
    chainId: 137,
    nodeRpc: String(process.env.BLOCKCHAIN_POLYGON_NODE),
    nativeToken: {
      chain: ChainNames.polygon,
      address: AddressZero,
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  [ChainNames.bnbchain]: {
    name: ChainNames.bnbchain,
    family: 'evm',
    chainId: 56,
    nodeRpc: String(process.env.BLOCKCHAIN_BNBCHAIN_NODE),
    nativeToken: {
      chain: ChainNames.bnbchain,
      address: AddressZero,
      symbol: 'BNB',
      decimals: 18,
    },
  },
  [ChainNames.avalanche]: {
    name: ChainNames.avalanche,
    family: 'evm',
    chainId: 43114,
    nodeRpc: String(process.env.BLOCKCHAIN_AVALANCHE_NODE),
    nativeToken: {
      chain: ChainNames.avalanche,
      address: AddressZero,
      symbol: 'AVAX',
      decimals: 18,
    },
  },
  [ChainNames.fantom]: {
    name: ChainNames.fantom,
    family: 'evm',
    chainId: 250,
    nodeRpc: String(process.env.BLOCKCHAIN_FANTOM_NODE),
    nativeToken: {
      chain: ChainNames.fantom,
      address: AddressZero,
      symbol: 'FTM',
      decimals: 18,
    },
  },
  [ChainNames.metis]: {
    name: ChainNames.metis,
    family: 'evm',
    chainId: 1088,
    nodeRpc: String(process.env.BLOCKCHAIN_METIS_NODE),
    nativeToken: {
      chain: ChainNames.metis,
      address: AddressZero,
      symbol: 'METIS',
      decimals: 18,
    },
  },
  [ChainNames.gnosis]: {
    name: ChainNames.gnosis,
    family: 'evm',
    chainId: 100,
    nodeRpc: String(process.env.BLOCKCHAIN_GNOSIS_NODE),
    nativeToken: {
      chain: ChainNames.gnosis,
      address: AddressZero,
      symbol: 'xDAI',
      decimals: 18,
    },
  },
  [ChainNames.scroll]: {
    name: ChainNames.scroll,
    family: 'evm',
    chainId: 534352,
    nodeRpc: String(process.env.BLOCKCHAIN_SCROLL_NODE),
    nativeToken: {
      chain: ChainNames.scroll,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.blast]: {
    name: ChainNames.blast,
    family: 'evm',
    chainId: 81457,
    nodeRpc: String(process.env.BLOCKCHAIN_BLAST_NODE),
    nativeToken: {
      chain: ChainNames.blast,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.linea]: {
    name: ChainNames.linea,
    family: 'evm',
    chainId: 59144,
    nodeRpc: String(process.env.BLOCKCHAIN_LINEA_NODE),
    nativeToken: {
      chain: ChainNames.linea,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.zksync]: {
    name: ChainNames.zksync,
    family: 'evm',
    chainId: 324,
    nodeRpc: String(process.env.BLOCKCHAIN_ZKSYNC_NODE),
    nativeToken: {
      chain: ChainNames.zksync,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.mode]: {
    name: ChainNames.mode,
    family: 'evm',
    chainId: 34443,
    nodeRpc: String(process.env.BLOCKCHAIN_MODE_NODE),
    nativeToken: {
      chain: ChainNames.mode,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.manta]: {
    name: ChainNames.manta,
    family: 'evm',
    chainId: 169,
    nodeRpc: String(process.env.BLOCKCHAIN_MANTA_NODE),
    nativeToken: {
      chain: ChainNames.manta,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.aurora]: {
    name: ChainNames.aurora,
    family: 'evm',
    chainId: 1313161554,
    nodeRpc: String(process.env.BLOCKCHAIN_AURORA_NODE),
    nativeToken: {
      chain: ChainNames.aurora,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.celo]: {
    name: ChainNames.celo,
    family: 'evm',
    chainId: 42220,
    nodeRpc: String(process.env.BLOCKCHAIN_CELO_NODE),
    nativeToken: {
      chain: ChainNames.celo,
      address: AddressZero,
      symbol: 'CELO',
      decimals: 18,
    },
  },
  [ChainNames.mantle]: {
    name: ChainNames.mantle,
    family: 'evm',
    chainId: 5000,
    nodeRpc: String(process.env.BLOCKCHAIN_MANTLE_NODE),
    nativeToken: {
      chain: ChainNames.mantle,
      address: AddressZero,
      symbol: 'MNT',
      decimals: 18,
    },
  },
  [ChainNames.polygonzkevm]: {
    name: ChainNames.polygonzkevm,
    family: 'evm',
    chainId: 1101,
    nodeRpc: String(process.env.BLOCKCHAIN_POLYGONZKEVM_NODE),
    nativeToken: {
      chain: ChainNames.polygonzkevm,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.zora]: {
    name: ChainNames.zora,
    family: 'evm',
    chainId: 7777777,
    nodeRpc: String(process.env.BLOCKCHAIN_ZORA_NODE),
    nativeToken: {
      chain: ChainNames.zora,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.merlin]: {
    name: ChainNames.merlin,
    family: 'evm',
    chainId: 4200,
    nodeRpc: String(process.env.BLOCKCHAIN_MERLIN_NODE),
    nativeToken: {
      chain: ChainNames.merlin,
      address: AddressZero,
      symbol: 'BTC',
      decimals: 18,
    },
  },
  [ChainNames.zklinknova]: {
    name: ChainNames.zklinknova,
    family: 'evm',
    chainId: 810180,
    nodeRpc: String(process.env.BLOCKCHAIN_ZKLINKNOVA_NODE),
    nativeToken: {
      chain: ChainNames.zklinknova,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.cronos]: {
    name: ChainNames.cronos,
    family: 'evm',
    chainId: 25,
    nodeRpc: String(process.env.BLOCKCHAIN_CRONOS_NODE),
    nativeToken: {
      chain: ChainNames.cronos,
      address: AddressZero,
      symbol: 'CRO',
      decimals: 18,
    },
  },
  [ChainNames.moonbeam]: {
    name: ChainNames.moonbeam,
    family: 'evm',
    chainId: 1284,
    nodeRpc: String(process.env.BLOCKCHAIN_MOONBEAM_NODE),
    nativeToken: {
      chain: ChainNames.moonbeam,
      address: AddressZero,
      symbol: 'GLMR',
      decimals: 18,
    },
  },
  [ChainNames.moonriver]: {
    name: ChainNames.moonriver,
    family: 'evm',
    chainId: 1285,
    nodeRpc: String(process.env.BLOCKCHAIN_MOONRIVER_NODE),
    nativeToken: {
      chain: ChainNames.moonriver,
      address: AddressZero,
      symbol: 'MOVR',
      decimals: 18,
    },
  },
  [ChainNames.core]: {
    name: ChainNames.core,
    family: 'evm',
    chainId: 1116,
    nodeRpc: String(process.env.BLOCKCHAIN_CORE_NODE),
    nativeToken: {
      chain: ChainNames.core,
      address: AddressZero,
      symbol: 'CORE',
      decimals: 18,
    },
  },
  [ChainNames.bitlayer]: {
    name: ChainNames.bitlayer,
    family: 'evm',
    chainId: 200901,
    nodeRpc: String(process.env.BLOCKCHAIN_BITLAYER_NODE),
    nativeToken: {
      chain: ChainNames.bitlayer,
      address: AddressZero,
      symbol: 'BTC',
      decimals: 18,
    },
  },
  [ChainNames.taiko]: {
    name: ChainNames.taiko,
    family: 'evm',
    chainId: 167000,
    nodeRpc: String(process.env.BLOCKCHAIN_TAIKO_NODE),
    nativeToken: {
      chain: ChainNames.taiko,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.seievm]: {
    name: ChainNames.seievm,
    family: 'evm',
    chainId: 1329,
    nodeRpc: String(process.env.BLOCKCHAIN_SEIEVM_NODE),
    nativeToken: {
      chain: ChainNames.seievm,
      address: AddressZero,
      symbol: 'SEI',
      decimals: 18,
    },
  },
  [ChainNames.bob]: {
    name: ChainNames.bob,
    family: 'evm',
    chainId: 60808,
    nodeRpc: String(process.env.BLOCKCHAIN_BOB_NODE),
    nativeToken: {
      chain: ChainNames.bob,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.bsquared]: {
    name: ChainNames.bsquared,
    family: 'evm',
    chainId: 223,
    nodeRpc: String(process.env.BLOCKCHAIN_BSQUARED_NODE),
    nativeToken: {
      chain: ChainNames.bsquared,
      address: AddressZero,
      symbol: 'BTC',
      decimals: 18,
    },
  },
  [ChainNames.ronin]: {
    name: ChainNames.ronin,
    family: 'evm',
    chainId: 2020,
    nodeRpc: String(process.env.BLOCKCHAIN_RONIN_NODE),
    nativeToken: {
      chain: ChainNames.ronin,
      address: AddressZero,
      symbol: 'RON',
      decimals: 18,
    },
  },
  [ChainNames.fraxtal]: {
    name: ChainNames.fraxtal,
    family: 'evm',
    chainId: 252,
    nodeRpc: String(process.env.BLOCKCHAIN_FRAXTAL_NODE),
    nativeToken: {
      chain: ChainNames.fraxtal,
      address: AddressZero,
      symbol: 'frxETH',
      decimals: 18,
    },
  },
  [ChainNames.redstone]: {
    name: ChainNames.redstone,
    family: 'evm',
    chainId: 690,
    nodeRpc: String(process.env.BLOCKCHAIN_REDSTONE_NODE),
    nativeToken: {
      chain: ChainNames.redstone,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.lisk]: {
    name: ChainNames.lisk,
    family: 'evm',
    chainId: 1135,
    nodeRpc: String(process.env.BLOCKCHAIN_LISK_NODE),
    nativeToken: {
      chain: ChainNames.lisk,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.kava]: {
    name: ChainNames.kava,
    family: 'evm',
    chainId: 2222,
    nodeRpc: String(process.env.BLOCKCHAIN_KAVA_NODE),
    nativeToken: {
      chain: ChainNames.kava,
      address: AddressZero,
      symbol: 'KAVA',
      decimals: 18,
    },
  },
  [ChainNames.kaia]: {
    name: ChainNames.kaia,
    family: 'evm',
    chainId: 8217,
    nodeRpc: String(process.env.BLOCKCHAIN_KAIA_NODE),
    nativeToken: {
      chain: ChainNames.kaia,
      address: AddressZero,
      symbol: 'KLAY',
      decimals: 18,
    },
  },
  [ChainNames.iotaevm]: {
    name: ChainNames.iotaevm,
    family: 'evm',
    chainId: 8822,
    nodeRpc: String(process.env.BLOCKCHAIN_IOTA_NODE),
    nativeToken: {
      chain: ChainNames.iotaevm,
      address: AddressZero,
      symbol: 'IOTA',
      decimals: 18,
    },
  },
  [ChainNames.rari]: {
    name: ChainNames.rari,
    family: 'evm',
    chainId: 1380012617,
    nodeRpc: String(process.env.BLOCKCHAIN_RARI_NODE),
    nativeToken: {
      chain: ChainNames.rari,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.gravity]: {
    name: ChainNames.gravity,
    family: 'evm',
    chainId: 1625,
    nodeRpc: String(process.env.BLOCKCHAIN_GRAVITY_NODE),
    nativeToken: {
      chain: ChainNames.gravity,
      address: AddressZero,
      symbol: 'G',
      decimals: 18,
    },
  },
  [ChainNames.flare]: {
    name: ChainNames.flare,
    family: 'evm',
    chainId: 14,
    nodeRpc: String(process.env.BLOCKCHAIN_FLARE_NODE),
    nativeToken: {
      chain: ChainNames.flare,
      address: AddressZero,
      symbol: 'FLR',
      decimals: 18,
    },
  },
  [ChainNames.opbnb]: {
    name: ChainNames.opbnb,
    family: 'evm',
    chainId: 204,
    nodeRpc: String(process.env.BLOCKCHAIN_OPBNB_NODE),
    nativeToken: {
      chain: ChainNames.opbnb,
      address: AddressZero,
      symbol: 'BNB',
      decimals: 18,
    },
  },
  [ChainNames.worldchain]: {
    name: ChainNames.worldchain,
    family: 'evm',
    chainId: 480,
    nodeRpc: String(process.env.BLOCKCHAIN_WORLDCHAIN_NODE),
    nativeToken: {
      chain: ChainNames.worldchain,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
  [ChainNames.fuse]: {
    name: ChainNames.fuse,
    family: 'evm',
    chainId: 122,
    nodeRpc: String(process.env.BLOCKCHAIN_FUSE_NODE),
    nativeToken: {
      chain: ChainNames.fuse,
      address: AddressZero,
      symbol: 'FUSE',
      decimals: 18,
    },
  },
  [ChainNames.boba]: {
    name: ChainNames.fuse,
    family: 'evm',
    chainId: 288,
    nodeRpc: String(process.env.BLOCKCHAIN_BOBA_NODE),
    nativeToken: {
      chain: ChainNames.boba,
      address: AddressZero,
      symbol: 'ETH',
      decimals: 18,
    },
  },
};
