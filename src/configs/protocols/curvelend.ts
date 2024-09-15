import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface CurvelendFactoryConfig {
  chain: string;
  birthday: number;
  factory: string;
  // ignore low liquidity vaults
  blacklists?: Array<string>;
}

export interface CurvelendProtocolConfig extends ProtocolConfig {
  factories: Array<CurvelendFactoryConfig>;
}

export const CurvelendConfigs: CurvelendProtocolConfig = {
  protocol: ProtocolNames.curvelend,
  category: ProtocolCategories.lending,
  birthday: 1710374400, // Thu Mar 14 2024 00:00:00 GMT+0000,
  factories: [
    {
      chain: ChainNames.ethereum,
      birthday: 1710374400, // Thu Mar 14 2024 00:00:00 GMT+0000,
      factory: '0xea6876dde9e3467564acbee1ed5bac88783205e0',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1711324800, // Mon Mar 25 2024 00:00:00 GMT+0000
      factory: '0xcaec110c784c9df37240a8ce096d352a75922dea',
      blacklists: [
        '0xb50409dd4d5b418042ab4dcee6a2fa7d1fe2fcf8',
        '0x7d622a3615b34abf84ac255b8c8d1685ea3a433f',
        '0xb56369a6519f84c6fd92644d421273618b8d62b0',
        '0x2415747a063b55bfeb65e22f9a95a83e0151e4f8',
        '0x9d3f07f173e5ae7b7a789ac870d23669af218e89',
        '0xc8248953429d707c6a2815653eca89846ffaa63b',
      ],
    },
  ],
};
