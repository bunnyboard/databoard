import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface CowswapSettlementConfig {
  chain: string;
  settlement: string;
  birthday: number;
}

export interface CowswapProtocolConfig extends ProtocolConfig {
  settlements: Array<CowswapSettlementConfig>;
}

export const CowswapConfigs: CowswapProtocolConfig = {
  protocol: ProtocolNames.cowswap,
  birthday: 1623196800, // Wed Jun 09 2021 00:00:00 GMT+0000
  settlements: [
    {
      chain: ChainNames.ethereum,
      birthday: 1623196800, // Wed Jun 09 2021 00:00:00 GMT+0000
      settlement: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1714089600, // Fri Apr 26 2024 00:00:00 GMT+0000
      settlement: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
    },
    {
      chain: ChainNames.gnosis,
      birthday: 1623196800, // Wed Jun 09 2021 00:00:00 GMT+0000
      settlement: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
    },
    {
      chain: ChainNames.base,
      birthday: 1698019200, // Mon Oct 23 2023 00:00:00 GMT+0000
      settlement: '0x9008D19f58AAbD9eD0D60971565AA8510560ab41',
    },
  ],
};
