import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig } from './compound';

export const VenusConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.venus,
  category: ProtocolCategories.lending,
  birthday: 1614211200, // Fri Jan 01 2021 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.bnbchain,
      marketName: 'Core Market',
      birthday: 1614211200, // Fri Jan 01 2021 00:00:00 GMT+0000
      comptroller: '0xfd36e2c2a6789db23113685031d7f16329158384',
      oracleSource: 'oracleUsd',
      blacklists: ['0xebd0070237a0713e8d94fef1b728d3d993d290ef', '0x20bff4bbeda07536ff00e073bd8359e5d80d733d'],
    },
    // {
    //   chain: ChainNames.bnbchain,
    //   marketName: 'Stablecoins Market',
    //   birthday: 1687564800, // Sat Jun 24 2023 00:00:00 GMT+0000
    //   comptroller: '0x94c1495cD4c557f1560Cbd68EAB0d197e6291571',
    //   oracleSource: 'oracleUsd',
    // },
    // {
    //   chain: ChainNames.bnbchain,
    //   marketName: 'DeFi Market',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   comptroller: '0x3344417c9360b963ca93A4e8305361AEde340Ab9',
    //   oracleSource: 'oracleUsd',
    // },
    // {
    //   chain: ChainNames.bnbchain,
    //   marketName: 'GameFi Market',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   comptroller: '0x1b43ea8622e76627B81665B1eCeBB4867566B963',
    //   oracleSource: 'oracleUsd',
    // },
    // {
    //   chain: ChainNames.bnbchain,
    //   marketName: 'Liquid Staked BNB Market',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   comptroller: '0xd933909A4a2b7A4638903028f44D1d38ce27c352',
    //   oracleSource: 'oracleUsd',
    // },
    // {
    //   chain: ChainNames.bnbchain,
    //   marketName: 'Tron Market',
    //   birthday: 1688083200, // Fri Jun 30 2023 00:00:00 GMT+0000
    //   comptroller: '0x23b4404E4E5eC5FF5a6FFb70B7d14E3FabF237B0',
    //   oracleSource: 'oracleUsd',
    // },
    // {
    //   chain: ChainNames.bnbchain,
    //   marketName: 'Meme Market',
    //   birthday: 1715817600, // Thu May 16 2024 00:00:00 GMT+0000
    //   comptroller: '0x33B6fa34cd23e5aeeD1B112d5988B026b8A5567d',
    //   oracleSource: 'oracleUsd',
    // },
    {
      chain: ChainNames.ethereum,
      marketName: 'Core Market',
      birthday: 1704844800, // Wed Jan 10 2024 00:00:00 GMT+0000
      comptroller: '0x687a01ecF6d3907658f7A7c714749fAC32336D1B',
      oracleSource: 'oracleUsd',
    },
    // {
    //   chain: ChainNames.ethereum,
    //   marketName: 'Curve Market',
    //   birthday: 1704844800, // Wed Jan 10 2024 00:00:00 GMT+0000
    //   comptroller: '0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796',
    //   oracleSource: 'oracleUsd',
    // },
    // {
    //   chain: ChainNames.ethereum,
    //   marketName: 'Liquid Staked ETH Market',
    //   birthday: 1706140800, // Thu Jan 25 2024 00:00:00 GMT+0000
    //   comptroller: '0xF522cd0360EF8c2FF48B648d53EA1717Ec0F3Ac3',
    //   oracleSource: 'oracleUsd',
    // },
    {
      chain: ChainNames.arbitrum,
      marketName: 'Core Market',
      birthday: 1717027200, // Thu May 30 2024 00:00:00 GMT+0000
      comptroller: '0x317c1A5739F39046E20b08ac9BeEa3f10fD43326',
      oracleSource: 'oracleUsd',
    },
  ],
};
