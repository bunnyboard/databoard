import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://radiant.capital/
// forked from Aave v2
export const RadiantConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.radiant,
  birthday: 1679184000, // Sun Mar 19 2023 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.ethereum,
      marketName: 'Core Market',
      version: 2,
      birthday: 1698710400, // Tue Oct 31 2023 00:00:00 GMT+0000
      lendingPool: '0xa950974f64aa33f27f6c5e017eee93bf7588ed07',
      dataProvider: '0x362f3bb63cff83bd169ae1793979e9e537993813',
      oracle: {
        currency: 'usd',
        address: '0xbd60293fbe4b285402510562a64e5fcee9c4a8f9',
      },
    },
    {
      chain: ChainNames.arbitrum,
      marketName: 'Core Market',
      version: 2,
      birthday: 1679184000, // Sun Mar 19 2023 00:00:00 GMT+0000
      lendingPool: '0xf4b1486dd74d07706052a33d31d7c0aafd0659e1',
      dataProvider: '0x596b0cc4c5094507c50b579a662fe7e7b094a2cc',
      oracle: {
        currency: 'usd',
        address: '0xc0ce5de939aad880b0bddcf9ab5750a53eda454b',
      },
    },
    {
      chain: ChainNames.bnbchain,
      marketName: 'Core Market',
      version: 2,
      birthday: 1679961600, // Tue Mar 28 2023 00:00:00 GMT+0000
      lendingPool: '0xd50cf00b6e600dd036ba8ef475677d816d6c4281',
      dataProvider: '0x2f9d57e97c3dfed8676e605bc504a48e0c5917e9',
      oracle: {
        currency: 'usd',
        address: '0x0bb5c1bc173b207cbf47cdf013617087776f3782',
      },
    },
    {
      chain: ChainNames.base,
      marketName: 'Core Market',
      version: 2,
      birthday: 1715990400, // Sat May 18 2024 00:00:00 GMT+0000
      lendingPool: '0x30798cfe2cca822321ceed7e6085e633aabc492f',
      dataProvider: '0x07d2dc09a1cbdd01e5f6ca984b060a3ff31b9eaf',
      oracle: {
        currency: 'usd',
        address: '0xe373749cd9b2d379f7f6dd595e5164498b922164',
      },
    },
  ],
};
