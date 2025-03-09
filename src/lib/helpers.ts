import { BlockchainConfigs } from '../configs/blockchains';

export function getChainNameById(chainId: number): string | null {
  for (const chainConfig of Object.values(BlockchainConfigs)) {
    if (chainConfig.chainId === chainId) {
      return chainConfig.name;
    }
  }

  return null;
}

export function getChainIdByName(name: string): number | null {
  for (const chainConfig of Object.values(BlockchainConfigs)) {
    if (chainConfig.name === name) {
      return chainConfig.chainId;
    }
  }

  return null;
}
