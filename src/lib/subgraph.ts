import axios from 'axios';
import logger from './logger';
import { sleep } from './utils';

export function getQueryEndpoint(subgraphId: string, apiKey: string): string {
  return `https://gateway.thegraph.com/api/${apiKey}/subgraphs/id/${subgraphId}`;
}

export async function querySubgraph(endpoint: string, query: string): Promise<any> {
  try {
    await sleep(1); // avoid rate limit
    const response = await axios.post(
      endpoint,
      {
        query: query,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.data.errors) {
      logger.warn('got some errors while query subgraph', {
        service: 'subgraph',
        endpoint: endpoint,
      });
      console.log(response.data.errors);
    }

    return response.data.data;
  } catch (e: any) {
    logger.warn('failed to query subgraph', {
      service: 'subgraph',
      endpoint: endpoint,
      error: e.message,
    });
    console.log(e);
    return null;
  }
}

export async function querySubgraphMetaBlock(endpoint: string): Promise<number> {
  try {
    await sleep(1); // avoid rate limit
    const response = await axios.post(
      endpoint,
      {
        query: `
          {
            _meta {
              block {
                number
              }
            }
          }
        `,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (response.data.errors) {
      logger.warn('got some errors while query subgraph', {
        service: 'subgraph',
        endpoint: endpoint,
      });
      console.log(response.data.errors);
    }

    return response.data.data ? Number(response.data.data._meta.block.number) : 0;
  } catch (e: any) {
    logger.warn('failed to query subgraph', {
      service: 'subgraph',
      endpoint: endpoint,
      error: e.message,
    });
    console.log(e);
    return 0;
  }
}
