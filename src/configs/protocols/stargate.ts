import { ChainNames } from '../names';

// https://stargateprotocol.gitbook.io/stargate/developers/chain-ids
export const StargateChainIds: { [key: number]: string } = {
  101: ChainNames.ethereum,
  30101: ChainNames.ethereum,
  102: ChainNames.bnbchain,
  30102: ChainNames.bnbchain,
  106: ChainNames.avalanche,
  30106: ChainNames.avalanche,
  109: ChainNames.polygon,
  30109: ChainNames.polygon,
  110: ChainNames.arbitrum,
  30110: ChainNames.arbitrum,
  111: ChainNames.optimism,
  30111: ChainNames.optimism,
  112: ChainNames.fantom,
  30112: ChainNames.fantom,
  151: ChainNames.metis,
  30151: ChainNames.metis,
  177: ChainNames.kava,
  30177: ChainNames.kava,
  181: ChainNames.mantle,
  30181: ChainNames.mantle,
  183: ChainNames.linea,
  30183: ChainNames.linea,
  184: ChainNames.base,
  30184: ChainNames.base,
  30214: ChainNames.scroll,
  30211: ChainNames.aurora,
  30150: ChainNames.kaia,
  30290: ChainNames.taiko,
};