import { ChainConfig, ChainFamilies } from '../types/base';
import { ChainNames } from './names';

export const ChainBoardConfigs: { [key: string]: ChainConfig } = {
  ethereum: {
    chain: ChainNames.ethereum,
    family: ChainFamilies.evm,
    nativeToken: 'ETH',
    eip1559: true,
    birthday: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    birthblock: 18896093,
    nodeRpcs: [
      'https://eth.llamarpc.com',
      'https://rpc.mevblocker.io',
      'https://rpc.mevblocker.io/fast',
      'https://eth.meowrpc.com',
      'https://rpc.flashbots.net',
      'https://cloudflare-eth.com',
      'https://eth-pokt.nodies.app',
      'https://rpc.ankr.com/eth',
      'https://ethereum.blockpi.network/v1/rpc/public',
    ],
  },
  arbitrum: {
    chain: ChainNames.arbitrum,
    family: ChainFamilies.evm,
    nativeToken: 'ETH',
    eip1559: false,
    birthday: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    birthblock: 165147776,
    nodeRpcs: [
      'https://arb1.arbitrum.io/rpc',
      'https://arb-pokt.nodies.app',
      'https://rpc.ankr.com/arbitrum',
      'https://arbitrum-one.publicnode.com',
      'https://arbitrum.meowrpc.com',
      'https://1rpc.io/arb',
      'https://arbitrum.llamarpc.com',
      'https://arbitrum.blockpi.network/v1/rpc/public',
    ],
  },
  bnbchain: {
    chain: ChainNames.bnbchain,
    family: ChainFamilies.evm,
    nativeToken: 'BNB',
    eip1559: true,
    birthday: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
    birthblock: 34812648,
    nodeRpcs: [
      'https://bscrpc.com',
      'https://binance.llamarpc.com',
      'https://rpc.ankr.com/bsc',
      'https://bsc-pokt.nodies.app',
      'https://bsc.drpc.org',
      'https://bsc-dataseed.bnbchain.org',
      'https://bsc-dataseed1.ninicoin.io',
      'https://1rpc.io/bnb',
      'https://bsc-dataseed4.defibit.io',
      'https://bsc-dataseed3.defibit.io',
    ],
  },
};
