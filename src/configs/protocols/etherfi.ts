import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface EthefiVault {
  boringVault: string;
  accountant: string;
}

export interface EtherfiProtocolConfig extends ProtocolConfig {
  chain: string;

  // eETH staking
  liquidityPool: string;

  // lens - data reader
  lens: string;

  // vaults contract birthday
  vaultsBirthtday: number;

  // staking vaults
  vaults: Array<EthefiVault>;
}

export const EtherfiConfigs: EtherfiProtocolConfig = {
  protocol: ProtocolNames.etherfi,
  birthday: 1689033600, // Tue Jul 11 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  liquidityPool: '0x308861A430be4cce5502d0A12724771Fc6DaF216',
  lens: '0x5232bc0F5999f8dA604c42E1748A13a170F94A1B',
  vaultsBirthtday: 1718236800, // Thu Jun 13 2024 00:00:00 GMT+0000
  vaults: [
    {
      boringVault: '0x657e8C867D8B37dCC18fA4Caead9C45EB088C642',
      accountant: '0x1b293DC39F94157fA0D1D36d7e0090C8B8B8c13F',
    },
    {
      boringVault: '0x939778D83b46B456224A33Fb59630B11DEC56663',
      accountant: '0xEB440B36f61Bf62E0C54C622944545f159C3B790',
    },
    {
      boringVault: '0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88',
      accountant: '0xbe16605B22a7faCEf247363312121670DFe5afBE',
    },
    {
      boringVault: '0x7223442cad8e9cA474fC40109ab981608F8c4273',
      accountant: '0x126af21dc55C300B7D0bBfC4F3898F558aE8156b',
    },
    {
      boringVault: '0x352180974C71f84a934953Cf49C4E538a6F9c997',
      accountant: '0xBae19b38Bf727Be64AF0B578c34985c3D612e2Ba',
    },
    {
      boringVault: '0xeDa663610638E6557c27e2f4e973D3393e844E70',
      accountant: '0x1D4F0F05e50312d3E7B65659Ef7d06aa74651e0C',
    },
    {
      boringVault: '0x08c6F91e2B681FaF5e17227F2a44C307b3C1364C',
      accountant: '0xc315D6e14DDCDC7407784e2Caf815d131Bc1D3E7',
    },
  ],
};
