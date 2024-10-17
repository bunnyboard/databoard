import { ProtocolCategories } from '../../types/base';
import { Pool2Types } from '../../types/domains/pool2';
import { PublicAddresses } from '../constants/addresses';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

export const PancakeConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.pancake,
  category: ProtocolCategories.dex,
  birthday: 1619222400, // Sat Apr 24 2021 00:00:00 GMT+0000
  dexes: [
    {
      chain: ChainNames.bnbchain,
      version: Pool2Types.univ2,
      factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
      birthday: 1619222400, // Sat Apr 24 2021 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.bnbchain.wbnb,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.ethereum,
      version: Pool2Types.univ2,
      factory: '0x1097053fd2ea711dad45caccc45eff7548fcb362',
      birthday: 1664236800, // Tue Sep 27 2022 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.ethereum.weth,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.arbitrum,
      version: Pool2Types.univ2,
      factory: '0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e',
      birthday: 1686787200, // Thu Jun 15 2023 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.arbitrum.weth,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.zksync,
      version: Pool2Types.univ2,
      factory: '0xd03D8D566183F0086d8D09A84E1e30b58Dd5619d',
      birthday: 1689465600, // Sun Jul 16 2023 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.zksync.weth,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.linea,
      version: Pool2Types.univ2,
      factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
      birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.linea.weth,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.base,
      version: Pool2Types.univ2,
      factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
      birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.base.weth,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.polygonzkevm,
      version: Pool2Types.univ2,
      factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
      birthday: 1686268800, // Fri Jun 09 2023 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.polygonzkevm.weth,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.opbnb,
      version: Pool2Types.univ2,
      factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
      birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.opbnb.wbnb,
      whitelistedPools: [],
    },
  ],
};
