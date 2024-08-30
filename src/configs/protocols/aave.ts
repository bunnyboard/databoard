import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface AaveOracleConfig {
  address: string; // oracle contract address

  // The Aave V2 Ethereum market uses ETH based oracles which return values in wei units.
  // All other V2 markets use USD based oracles which return values with 8 decimals.
  // https://docs.aave.com/developers/v/2.0/the-core-protocol/price-oracle

  // Returns the price of the supported asset in BASE_CURRENCY of the Aave Market.
  // All V3 markets use USD based oracles which return values with 8 decimals.
  // https://docs.aave.com/developers/core-contracts/aaveoracle
  currency: 'eth' | 'usd';

  // defaul: 8
  decimals?: number;
}

export interface AaveLendingMarketConfig {
  chain: string;

  // market name id
  marketName: string;

  version: 1 | 2 | 3;

  // lending pool
  lendingPool: string;

  // for faster query market data
  dataProvider: string;

  // token rewards and incentives
  incentiveController?: string;

  // get token price directly from aave oracle if any
  oracle?: AaveOracleConfig;

  // where market was deployed
  birthday: number;

  // list of ignored tokens
  blacklists?: {
    [key: string]: boolean;
  };
}

export interface AaveProtocolConfig extends ProtocolConfig {
  lendingMarkets: Array<AaveLendingMarketConfig>;
}

export const AaveConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.aave,
  category: ProtocolCategories.lending,
  birthday: 1578528000, // Thu Jan 09 2020 00:00:00 GMT+0000
  lendingMarkets: [
    // version 1
    {
      chain: ChainNames.ethereum,
      marketName: 'Main Market',
      version: 1,
      birthday: 1578528000, // Thu Jan 09 2020 00:00:00 GMT+0000
      lendingPool: '0x398eC7346DcD622eDc5ae82352F02bE94C62d119',
      dataProvider: '0x082B0cA59f2122c94E5F57Db0085907fa9584BA6',
      oracle: {
        currency: 'eth',
        address: '0x76B47460d7F7c5222cFb6b6A75615ab10895DDe4',
      },
    },

    // version 2
    {
      chain: ChainNames.ethereum,
      marketName: 'Main Market',
      version: 2,
      birthday: 1606780800, // Tue Dec 01 2020 00:00:00 GMT+0000
      lendingPool: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9',
      dataProvider: '0x057835ad21a177dbdd3090bb1cae03eacf78fc6d',
      oracle: {
        currency: 'eth',
        address: '0xa50ba011c48153de246e5192c8f9258a2ba79ca9',
      },
    },
    {
      chain: ChainNames.polygon,
      marketName: 'Main Market',
      version: 2,
      birthday: 1617235200, // Thu Apr 01 2021 00:00:00 GMT+0000
      lendingPool: '0x8dff5e27ea6b7ac08ebfdf9eb090f32ee9a30fcf',
      dataProvider: '0x7551b5d2763519d4e37e8b81929d336de671d46d',
      oracle: {
        currency: 'eth',
        address: '0x0229f777b0fab107f9591a41d5f02e4e98db6f2d',
      },
    },
    {
      chain: ChainNames.avalanche,
      marketName: 'Main Market',
      version: 2,
      birthday: 1632182400, // Tue Sep 21 2021 00:00:00 GMT+0000
      lendingPool: '0x4f01aed16d97e3ab5ab2b501154dc9bb0f1a5a2c',
      dataProvider: '0x65285e9dfab318f57051ab2b139cccf232945451',
      oracle: {
        currency: 'usd',
        address: '0xdc336cd4769f4cc7e9d726da53e6d3fc710ceb89',
      },
    },

    // version 3
    {
      chain: ChainNames.ethereum,
      marketName: 'Main Market',
      version: 3,
      birthday: 1674864000, // Sat Jan 28 2023 00:00:00 GMT+0000
      lendingPool: '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2',
      dataProvider: '0x7b4eb56e7cd4b454ba8ff71e4518426369a138a3',
      oracle: {
        currency: 'usd',
        address: '0x54586be62e3c3580375ae3723c145253060ca0c2',
      },
    },
    {
      chain: ChainNames.ethereum,
      marketName: 'Lido Market',
      version: 3,
      birthday: 1720483200, // Tue Jul 09 2024 00:00:00 GMT+0000
      lendingPool: '0x4e033931ad43597d96d6bcc25c280717730b58b1',
      dataProvider: '0xa3206d66cf94aa1e93b21a9d8d409d6375309f4a',
      oracle: {
        currency: 'usd',
        address: '0xe3c061981870c0c7b1f3c4f4bb36b95f1f260be6',
      },
    },
    {
      chain: ChainNames.optimism,
      marketName: 'Main Market',
      version: 3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      lendingPool: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
      dataProvider: '0x69fa688f1dc47d4b5d8029d5a35fb7a548310654',
      oracle: {
        currency: 'usd',
        address: '0xd81eb3728a631871a7ebbad631b5f424909f0c77',
      },
    },
    {
      chain: ChainNames.arbitrum,
      marketName: 'Main Market',
      version: 3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      lendingPool: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
      dataProvider: '0x69fa688f1dc47d4b5d8029d5a35fb7a548310654',
      oracle: {
        currency: 'usd',
        address: '0xb56c2f0b653b2e0b10c9b928c8580ac5df02c7c7',
      },
    },
    {
      chain: ChainNames.arbitrum,
      marketName: 'Main Market',
      version: 3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      lendingPool: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
      dataProvider: '0x69fa688f1dc47d4b5d8029d5a35fb7a548310654',
      oracle: {
        currency: 'usd',
        address: '0xb56c2f0b653b2e0b10c9b928c8580ac5df02c7c7',
      },
    },
    {
      chain: ChainNames.polygon,
      marketName: 'Main Market',
      version: 3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      lendingPool: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
      dataProvider: '0x69fa688f1dc47d4b5d8029d5a35fb7a548310654',
      oracle: {
        currency: 'usd',
        address: '0xb023e699f5a33916ea823a16485e259257ca8bd1',
      },
    },
    {
      chain: ChainNames.avalanche,
      marketName: 'Main Market',
      version: 3,
      birthday: 1647043200, // Sat Mar 12 2022 00:00:00 GMT+0000
      lendingPool: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
      dataProvider: '0x69fa688f1dc47d4b5d8029d5a35fb7a548310654',
      oracle: {
        currency: 'usd',
        address: '0xebd36016b3ed09d4693ed4251c67bd858c3c7c9c',
      },
    },
    {
      chain: ChainNames.fantom,
      marketName: 'Main Market',
      version: 3,
      birthday: 1692748800, // Wed Aug 23 2023 00:00:00 GMT+0000
      lendingPool: '0x794a61358d6845594f94dc1db02a252b5b4814ad',
      dataProvider: '0x69fa688f1dc47d4b5d8029d5a35fb7a548310654',
      oracle: {
        currency: 'usd',
        address: '0xfd6f3c1845604c8ae6c6e402ad17fb9885160754',
      },
    },
    {
      chain: ChainNames.base,
      marketName: 'Main Market',
      version: 3,
      birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
      lendingPool: '0xa238dd80c259a72e81d7e4664a9801593f98d1c5',
      dataProvider: '0x2d8a3c5677189723c4cb8873cfc9c8976fdf38ac',
      oracle: {
        currency: 'usd',
        address: '0x2cc0fc26ed4563a5ce5e8bdcfe1a2878676ae156',
      },
    },
    {
      chain: ChainNames.metis,
      marketName: 'Main Market',
      version: 3,
      birthday: 1682294400, // Mon Apr 24 2023 00:00:00 GMT+0000
      lendingPool: '0x90df02551bb792286e8d4f13e0e357b4bf1d6a57',
      dataProvider: '0x99411fc17ad1b56f49719e3850b2cdcc0f9bbfd8',
      oracle: {
        currency: 'usd',
        address: '0x38d36e85e47ea6ff0d18b0adf12e5fc8984a6f8e',
      },
    },
    {
      chain: ChainNames.gnosis,
      marketName: 'Main Market',
      version: 3,
      birthday: 1696464000, // Thu Oct 05 2023 00:00:00 GMT+0000
      lendingPool: '0xb50201558b00496a145fe76f7424749556e326d8',
      dataProvider: '0x501b4c19dd9c2e06e94da7b6d5ed4dda013ec741',
      oracle: {
        currency: 'usd',
        address: '0xeb0a051be10228213baeb449db63719d6742f7c4',
      },
    },
    {
      chain: ChainNames.bnbchain,
      marketName: 'Main Market',
      version: 3,
      birthday: 1706054400, // Wed Jan 24 2024 00:00:00 GMT+0000
      lendingPool: '0x6807dc923806fe8fd134338eabca509979a7e0cb',
      dataProvider: '0x41585c50524fb8c3899b43d7d797d9486aac94db',
      oracle: {
        currency: 'usd',
        address: '0x39bc1bfda2130d6bb6dbefd366939b4c7aa7c697',
      },
    },
    {
      chain: ChainNames.scroll,
      marketName: 'Main Market',
      version: 3,
      birthday: 1705795200, // Sun Jan 21 2024 00:00:00 GMT+0000
      lendingPool: '0x11fCfe756c05AD438e312a7fd934381537D3cFfe',
      dataProvider: '0xa99F4E69acF23C6838DE90dD1B5c02EA928A53ee',
      oracle: {
        currency: 'usd',
        address: '0x04421D8C506E2fA2371a08EfAaBf791F624054F3',
      },
    },
  ],
};
