import { ProtocolCategories } from '../../types/base';
import { Pool2Types } from '../../types/domains/pool2';
import { PublicAddresses } from '../constants/addresses';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';
import SpookyPools from '../data/pool2/spooky.json';
import { compareAddress } from '../../lib/utils';

export const SpookyConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.spooky,
  category: ProtocolCategories.dex,
  birthday: 1618704000, // Sun Apr 18 2021 00:00:00 GMT+0000
  dexes: [
    {
      chain: ChainNames.fantom,
      version: Pool2Types.univ2,
      factory: '0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3',
      birthday: 1618704000, // Sun Apr 18 2021 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.fantom.wftm,
      whitelistedPools: SpookyPools.filter((pool) => pool.chain === ChainNames.fantom).filter((pool) =>
        compareAddress(pool.factory, '0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3'),
      ),
    },
    {
      chain: ChainNames.fantom,
      version: Pool2Types.univ3,
      factory: '0x7928a2c48754501f3a8064765ECaE541daE5c3E6',
      birthday: 1700697600, // Thu Nov 23 2023 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.fantom.wftm,
      whitelistedPools: SpookyPools.filter((pool) => pool.chain === ChainNames.fantom).filter((pool) =>
        compareAddress(pool.factory, '0x7928a2c48754501f3a8064765ECaE541daE5c3E6'),
      ),
    },
  ],
};
