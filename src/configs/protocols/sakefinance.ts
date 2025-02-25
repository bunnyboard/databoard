import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://docs.sakefinance.com/sake-finance/resources/contract-addresses
// forked from Aave v3
export const SakefinanceConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.sakefinance,
  birthday: 1736380800, // Thu Jan 09 2025 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.soneium,
      marketName: 'Main Market',
      version: 3,
      birthday: 1736380800, // Thu Jan 09 2025 00:00:00 GMT+0000
      lendingPool: '0x3C3987A310ee13F7B8cBBe21D97D4436ba5E4B5f',
      dataProvider: '0x2BECa16DAa6Decf9C6F85eBA8F0B35696A3200b3',
      oracle: {
        currency: 'usd',
        address: '0x18530Af497F558e23134E223244F353ea776aF2A',
      },
    },
  ],
};
