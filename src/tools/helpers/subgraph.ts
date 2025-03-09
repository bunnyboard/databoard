import envConfig from '../../configs/envConfig';

export function getSubgraphEndpoint(subgraphId: string): string {
  return `https://gateway.thegraph.com/api/${envConfig.thegraph.thegraphApiKey}/subgraphs/id/${subgraphId}`;
}
