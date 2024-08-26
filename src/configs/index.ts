import { Token } from '../types/base';
import { TokenBookDexBase, TokensBook } from './data';
import { AaveConfigs } from './protocols/aave';
import { AvalonConfigs } from './protocols/avalon';

export const DefaultQueryContractLogsBlockRange = 1000;
export const CustomQueryContractLogsBlockRange: { [key: string]: number } = {
  polygon: 200,
  merlin: 200,
  zklinknova: 50,
  ronin: 400,
};

export const DefaultMemcacheTime = 300; // 5 minutes

export const TokenList: { [key: string]: { [key: string]: Token } } = TokensBook;
export const TokenDexBase = TokenBookDexBase;

export const ProtocolConfigs = {
  aave: AaveConfigs,
  avalon: AvalonConfigs,
};
