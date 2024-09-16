import { ChainConfigs } from '../../configs';
import { IOracleService } from '../../services/oracle/domains';
import { ContextStorages, IChainAdapter } from '../../types/namespaces';
import EvmChainAdapter from './evm';

export function getChainAdapters(
  priceOracle: IOracleService,
  storages: ContextStorages,
): { [key: string]: IChainAdapter } {
  return {
    ethereum: new EvmChainAdapter(priceOracle, storages, ChainConfigs.ethereum),
    arbitrum: new EvmChainAdapter(priceOracle, storages, ChainConfigs.arbitrum),
    bnbchain: new EvmChainAdapter(priceOracle, storages, ChainConfigs.bnbchain),
  };
}
