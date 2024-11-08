import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface RubicExchangeConfig {
  chain: string;
  birthday: number;
  exchange: string;
}

export interface RubicProtocolConfig extends ProtocolConfig {
  exchanges: Array<RubicExchangeConfig>;
}

export const RubicConfigs: RubicProtocolConfig = {
  protocol: ProtocolNames.rubic,
  category: ProtocolCategories.aggregator,
  birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
  exchanges: [
    {
      chain: ChainNames.ethereum,
      birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
      exchange: '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
      exchange: '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
      exchange: '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3',
    },
    {
      chain: ChainNames.base,
      birthday: 1691539200, // Wed Aug 09 2023 00:00:00 GMT+0000
      exchange: '0xAf14797CcF963B1e3d028a9d51853acE16aedBA1',
    },
    {
      chain: ChainNames.blast,
      birthday: 1709596800, // Tue Mar 05 2024 00:00:00 GMT+0000
      exchange: '0xAf14797CcF963B1e3d028a9d51853acE16aedBA1',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
      exchange: '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3',
    },
    {
      chain: ChainNames.cronos,
      birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
      exchange: '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3',
    },
    {
      chain: ChainNames.fantom,
      birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
      exchange: '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3',
    },
    {
      chain: ChainNames.linea,
      birthday: 1690934400, // Wed Aug 02 2023 00:00:00 GMT+0000
      exchange: '0xAf14797CcF963B1e3d028a9d51853acE16aedBA1',
    },
    {
      chain: ChainNames.mantle,
      birthday: 1693353600, // Wed Aug 30 2023 00:00:00 GMT+0000
      exchange: '0xAf14797CcF963B1e3d028a9d51853acE16aedBA1',
    },
    {
      chain: ChainNames.metis,
      birthday: 1700870400, // Sat Nov 25 2023 00:00:00 GMT+0000
      exchange: '0xAf14797CcF963B1e3d028a9d51853acE16aedBA1',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1700870400, // Sat Nov 25 2023 00:00:00 GMT+0000
      exchange: '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
      exchange: '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1697846400, // Sat Oct 21 2023 00:00:00 GMT+0000
      exchange: '0xAf14797CcF963B1e3d028a9d51853acE16aedBA1',
    },
    {
      chain: ChainNames.polygonzkevm,
      birthday: 1689120000, // Wed Jul 12 2023 00:00:00 GMT+0000
      exchange: '0x6AA981bFF95eDfea36Bdae98C26B274FfcafE8d3',
    },
    {
      chain: ChainNames.zksync,
      birthday: 1683849600, // Fri May 12 2023 00:00:00 GMT+0000
      exchange: '0xa63c029612ddaD00A269383Ab016D1e7c14E851D',
    },
  ],
};
