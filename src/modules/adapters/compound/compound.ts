import { TimeUnits } from '../../../configs/constants';
import { ChainNames, ProtocolNames } from '../../../configs/names';
import { CompoundProtocolConfig } from '../../../configs/protocols/compound';
import { getTimestamp } from '../../../lib/utils';
import { ProtocolCategories, ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { TestAdapterOptions } from '../../../types/options';
import CompoundCore from './core';

export default class CompoundAdapter extends CompoundCore {
  public readonly name: string = 'adapter.compound';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async runTest(options: TestAdapterOptions): Promise<void> {
    const config: CompoundProtocolConfig = {
      protocol: ProtocolNames.compound,
      category: ProtocolCategories.lending,
      birthday: 1557273600, // Wed May 08 2019 00:00:00 GMT+0000
      comptrollers: [
        {
          chain: ChainNames.ethereum,
          marketName: 'Core Market',
          birthday: 1557273600, // Wed May 08 2019 00:00:00 GMT+0000
          comptroller: '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
          oracleSource: 'external',
          cTokenMappings: {
            '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5': {
              chain: 'ethereum',
              address: '0x0000000000000000000000000000000000000000',
              symbol: 'ETH',
              decimals: 18,
            },
          },
          preDefinedMarkets: [
            '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
            '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
            '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
            '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1',
            '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
            '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
            '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4',
            '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407',
            '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC',
          ],
        },
      ],
    };

    this.protocolConfig = config;

    const timestamp = options.timestamp ? options.timestamp : getTimestamp();
    const protocolData = await this.getProtocolData({
      timestamp: timestamp,
      beginTime: timestamp - TimeUnits.SecondsPerDay,
      endTime: timestamp,
    });

    if (options.output === 'json') {
      console.log(JSON.stringify(protocolData));
    } else {
      console.log(protocolData);
    }
  }
}
