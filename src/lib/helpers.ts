import { BlockchainConfigs } from '../configs/blockchains';

export function getChainNameById(chainId: number): string | null {
  for (const chainConfig of Object.values(BlockchainConfigs)) {
    if (chainConfig.chainId === chainId) {
      return chainConfig.name;
    }
  }

  return null;
}
