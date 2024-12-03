import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://www.lendle.xyz
// forked from Aave v2
export const LendleConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.lendle,
  birthday: 1689984000, // Sat Jul 22 2023 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.mantle,
      marketName: 'Main Market',
      version: 2,
      birthday: 1689984000, // Sat Jul 22 2023 00:00:00 GMT+0000
      lendingPool: '0xCFa5aE7c2CE8Fadc6426C1ff872cA45378Fb7cF3',
      dataProvider: '0x552b9e4bae485C4B7F540777d7D25614CdB84773',
      oracle: {
        currency: 'usd',
        decimals: 18,
        address: '0x870c9692Ab04944C86ec6FEeF63F261226506EfC',
      },
    },
  ],
};
