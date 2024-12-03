import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig } from './compound';

export const IronbankConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.ironbank,
  birthday: 1607126400, // Sat Dec 05 2020 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.ethereum,
      marketName: 'Main Market',
      birthday: 1607126400, // Sat Dec 05 2020 00:00:00 GMT+0000
      comptroller: '0xAB1c342C7bf5Ec5F02ADEA1c2270670bCa144CbB',
      oracleSource: 'oracleUsd',
      blacklists: ['0x7589c9e17bcfce1ccaa1f921196fda177f0207fc'],
    },
    {
      chain: ChainNames.fantom,
      marketName: 'Main Market',
      birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
      comptroller: '0x4250A6D3BD57455d7C6821eECb6206F507576cD2',
      oracleSource: 'oracleUsd',
    },
    {
      chain: ChainNames.avalanche,
      marketName: 'Main Market',
      birthday: 1633737600, // Sat Oct 09 2021 00:00:00 GMT+0000
      comptroller: '0x2eE80614Ccbc5e28654324a66A396458Fa5cD7Cc',
      oracleSource: 'oracleUsd',
    },
    {
      chain: ChainNames.optimism,
      marketName: 'Main Market',
      birthday: 1660521600, // Mon Aug 15 2022 00:00:00 GMT+0000
      comptroller: '0xE0B57FEEd45e7D908f2d0DaCd26F113Cf26715BF',
      oracleSource: 'oracleUsd',
    },
  ],
};
