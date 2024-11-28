import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

// avax/pol staking
export interface AnkrBondPoolConfig {
  chain: string;
  birthday: number;
  bondToken: string;
  stakingPool: string;
  token?: string;
}

// bnb/eth staking
export interface AnkrStakingPoolConfig {
  chain: string;
  birthday: number;
  ankrToken: string;
  stakingPool: string;
}

export interface AnkrProtocolConfig extends ProtocolConfig {
  ethStaking: AnkrStakingPoolConfig;
  bnbStaking: AnkrStakingPoolConfig;
  avaxStaking: AnkrBondPoolConfig;
  ftmStaking: AnkrBondPoolConfig;
  polStaking: AnkrBondPoolConfig;
}

export const AnkrConfigs: AnkrProtocolConfig = {
  protocol: ProtocolNames.ankr,
  category: ProtocolCategories.liquidStaking,
  birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
  ethStaking: {
    chain: ChainNames.ethereum,
    birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
    ankrToken: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
    stakingPool: '0x84db6eE82b7Cf3b47E8F19270abdE5718B936670',
  },
  bnbStaking: {
    chain: ChainNames.bnbchain,
    birthday: 1670544000, // Fri Dec 09 2022 00:00:00 GMT+0000
    ankrToken: '0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827',
    stakingPool: '0x9e347Af362059bf2E55839002c699F7A5BaFE86E',
  },
  avaxStaking: {
    chain: ChainNames.avalanche,
    birthday: 1620864000, // Thu May 13 2021 00:00:00 GMT+0000
    bondToken: '0x6C6f910A79639dcC94b4feEF59Ff507c2E843929',
    stakingPool: '0x7BAa1E3bFe49db8361680785182B80BB420A836D',
  },
  ftmStaking: {
    chain: ChainNames.fantom,
    birthday: 1645142400, // Fri Feb 18 2022 00:00:00 GMT+0000
    bondToken: '0xB42bF10ab9Df82f9a47B86dd76EEE4bA848d0Fa2',
    stakingPool: '0x84db6eE82b7Cf3b47E8F19270abdE5718B936670',
  },
  polStaking: {
    chain: ChainNames.ethereum,
    birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
    bondToken: '0x99534Ef705Df1FFf4e4bD7bbaAF9b0dFf038EbFe',
    stakingPool: '0xCfD4B4Bc15C8bF0Fd820B0D4558c725727B3ce89',
    token: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0', // POL
  },
};
