import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://www.avalonfinance.xyz/
// forked from Aave v3
export const AvalonConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.avalon,
  category: ProtocolCategories.lending,
  birthday: 1711497600, // Wed Mar 27 2024 00:00:00 GMT+0000
  lendingMarkets: [
    // merlin chain
    {
      chain: ChainNames.merlin,
      marketName: 'Main Market',
      version: 3,
      birthday: 1711497600, // Wed Mar 27 2024 00:00:00 GMT+0000
      lendingPool: '0xea5c99a3cca5f95ef6870a1b989755f67b6b1939',
      dataProvider: '0x5f314b36412765f3e1016632fd1ad528929536ca',
      oracle: {
        currency: 'usd',
        address: '0x191a6ac7cbc29de2359de10505e05935a1ed5478',
      },
    },
    {
      chain: ChainNames.merlin,
      marketName: 'UniBTC Market',
      version: 3,
      birthday: 1724198400, // Wed Aug 21 2024 00:00:00 GMT+0000
      lendingPool: '0x155d50D9c1D589631eA4E2eaD744CE82622AD9D3',
      dataProvider: '0x623700Fee1dF64088f258e2c4DAB4D6aEac4dDA6',
      oracle: {
        currency: 'usd',
        address: '0x5223FDB92ce3f183AB40215be8b89bcc6a2021E0',
      },
    },
    {
      chain: ChainNames.merlin,
      marketName: 'Innovation Market',
      version: 3,
      birthday: 1711497600, // Wed Mar 27 2024 00:00:00 GMT+0000
      lendingPool: '0xdCB0FAA822B99B87E630BF47399C5a0bF3C642cf',
      dataProvider: '0x883cb2E2d9c5D4D9aF5b0d37fc39Fa2284405682',
      oracle: {
        currency: 'usd',
        address: '0xf987b8A92907e8Bfcf7a9CfB62bf3B4c45Db7f4d',
      },
    },

    // bitlayer
    {
      chain: ChainNames.bitlayer,
      marketName: 'Main Market',
      version: 3,
      birthday: 1714953600, // Mon May 06 2024 00:00:00 GMT+0000
      lendingPool: '0xEA5c99A3cca5f95Ef6870A1B989755f67B6B1939',
      dataProvider: '0x5F314b36412765f3E1016632fD1Ad528929536CA',
      oracle: {
        currency: 'usd',
        address: '0x191a6ac7cbC29De2359de10505E05935a1Ed5478',
      },
    },
    // {
    //   chain: ChainNames.bitlayer,
    //   marketName: 'Lorenzo Market',
    //   version: 3,
    //   birthday: 1720742400, // Fri Jul 12 2024 00:00:00 GMT+0000
    //   lendingPool: '0xeD6d6d18F20f8b419B5442C43D3e48EE568dEc14',
    //   dataProvider: '0x4c25c261Fe47bC216113D140BaF72B05E151bcE4',
    //   oracle: {
    //     currency: 'usd',
    //     address: '0xa8FF2907E9853b7aa48b392A1f685d3597a7de92',
    //   },
    // },

    // core
    {
      chain: ChainNames.core,
      marketName: 'Main Market',
      version: 3,
      birthday: 1716336000, // Wed May 22 2024 00:00:00 GMT+0000
      lendingPool: '0x67197de79b2a8fc301bab591c78ae5430b9704fd',
      dataProvider: '0x802cb61844325dc9a161bc3a498e3be1b7b6fe00',
      oracle: {
        currency: 'usd',
        address: '0x5ca296a74278bfc0fe3ee86abf7f536afef520f8',
      },
    },

    // bnbchain
    {
      chain: ChainNames.bnbchain,
      marketName: 'Main Market',
      version: 3,
      birthday: 1714953600, // Mon May 06 2024 00:00:00 GMT+0000
      lendingPool: '0xf9278c7c4aefac4ddfd0d496f7a1c39ca6bca6d4',
      dataProvider: '0x672b19dda450120c505214d149ee7f7b6ded8c39',
      oracle: {
        currency: 'usd',
        address: '0xc204f75f22ec427869abf80b1b8cf98e028f7fc1',
      },
    },

    // arbitrum
    {
      chain: ChainNames.arbitrum,
      marketName: 'Main Market',
      version: 3,
      birthday: 1715558400, // Mon May 13 2024 00:00:00 GMT+0000
      lendingPool: '0xe1ee45db12ac98d16f1342a03c93673d74527b55',
      dataProvider: '0xec579d2ce07401258710199ff12a5bb56e086a6f',
      oracle: {
        currency: 'usd',
        address: '0x16d0d4d24305ae29161a42f51d15dc8586bbdc9b',
      },
    },

    // taiko
    {
      chain: ChainNames.taiko,
      marketName: 'Main Market',
      version: 3,
      birthday: 1730246400, // Wed Oct 30 2024 00:00:00 GMT+0000
      lendingPool: '0x9dd29AA2BD662E6b569524ba00C55be39e7B00fB',
      dataProvider: '0xF6Aa54a5b60c324602C9359E8221423793e5205d',
      oracle: {
        currency: 'usd',
        address: '0xde32a52507BA4829fd433BCA44df340d96e1927E',
      },
    },

    // bob
    {
      chain: ChainNames.bob,
      marketName: 'Main Market',
      version: 3,
      birthday: 1722297600, // Tue Jul 30 2024 00:00:00 GMT+0000
      lendingPool: '0x35B3F1BFe7cbE1e95A3DC2Ad054eB6f0D4c879b6',
      dataProvider: '0xfabb0fDca4348d5A40EB1BB74AEa86A1C4eAd7E2',
      oracle: {
        currency: 'usd',
        address: '0x1Ad709515052E51057553187624DEa464bc00dd2',
      },
    },
  ],
};
