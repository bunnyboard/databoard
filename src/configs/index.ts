import { Token } from '../types/base';
import { TokenBookDexBase, TokensBook } from './data';
import { AaveConfigs } from './protocols/aave';
import { AvalonConfigs } from './protocols/avalon';
import { ColendConfigs } from './protocols/colend';
import { HanaConfigs } from './protocols/hana';
import { IroncladConfigs } from './protocols/ironclad';
import { KinzaConfigs } from './protocols/kinza';
import { LendleConfigs } from './protocols/lendle';
import { PacConfigs } from './protocols/pac';
import { PolterConfigs } from './protocols/polter';
import { RadiantConfigs } from './protocols/radiant';
import { SeamlessConfigs } from './protocols/seamless';
import { SparkConfigs } from './protocols/spark';
import { UwulendConfigs } from './protocols/uwulend';
import { YeifinanceConfigs } from './protocols/yeifinance';
import { ZerolendConfigs } from './protocols/zerolend';

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
  colend: ColendConfigs,
  hana: HanaConfigs,
  ironclad: IroncladConfigs,
  kinza: KinzaConfigs,
  lendle: LendleConfigs,
  pac: PacConfigs,
  polter: PolterConfigs,
  radiant: RadiantConfigs,
  seamless: SeamlessConfigs,
  spark: SparkConfigs,
  uwulend: UwulendConfigs,
  yeifinance: YeifinanceConfigs,
  zerolend: ZerolendConfigs,
};
