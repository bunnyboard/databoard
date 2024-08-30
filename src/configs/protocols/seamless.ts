import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://www.seamlessprotocol.com/
// forked from Aave v3
export const SeamlessConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.seamless,
  category: ProtocolCategories.lending,
  birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.base,
      marketName: 'Main Market',
      version: 3,
      birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
      lendingPool: '0x8f44fd754285aa6a2b8b9b97739b79746e0475a7',
      dataProvider: '0x2a0979257105834789bc6b9e1b00446dfba8dfba',
      oracle: {
        currency: 'usd',
        address: '0xfdd4e83890bccd1fbf9b10d71a5cc0a738753b01',
      },
      blacklists: {
        '0x4ed4e862860bed51a9570b96d89af5e1b0efefed': true, // DEGEN
        '0xc9ae3b5673341859d3ac55941d27c8be4698c9e4': true, // rwstETH
        '0x3e8707557d4ad25d6042f590bcf8a06071da2c5f': true, // rWETH
        '0x9660af3b1955648a72f5c958e80449032d645755': true,
      },
    },
  ],
};
