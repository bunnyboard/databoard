import axios from 'axios';

import { OracleSourceOffchain } from '../../types/oracles';
import { sleep } from '../../lib/utils';

// https://docs.coingecko.com/v3.0.1/reference/coins-id-history
export async function getTokenPriceFromCoingecko(
  source: OracleSourceOffchain,
  timestamp: number,
  apiKey: string,
): Promise<string> {
  // avoid rate limit
  await sleep(2);
  try {
    const date = new Date(timestamp * 1000).toISOString().split('T')[0];
    const [year, month, day] = date.split('-');
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${source.ticker}/history?date=${day}-${month}-${year}&localization=false`,
      {
        headers: {
          'x-cg-demo-api-key': apiKey,
        },
      },
    );
    if (response.data && response.data.market_data && response.data.market_data.current_price) {
      return response.data.market_data.current_price.usd ? response.data.market_data.current_price.usd.toString() : '0';
    }
  } catch (e: any) {}

  return '0';
}
