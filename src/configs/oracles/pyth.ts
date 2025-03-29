import { OracleSourcePyth } from '../../types/oracles';

export const OracleSourcePythList: { [key: string]: OracleSourcePyth } = {
  BERA_USD: {
    type: 'pyth',
    chain: 'berachain',
    address: '0x2880ab155794e7179c9ee2e38200202908c17b43',
    assetId: '0x962088abcfdbdb6e30db2e340c8cf887d9efb311b1f2f17b155a63dbb6d40265',
  },
  IP_USD: {
    type: 'pyth',
    chain: 'story',
    address: '0xD458261E832415CFd3BAE5E416FdF3230ce6F134',
    assetId: '0xb620ba83044577029da7e4ded7a2abccf8e6afc2a0d4d26d89ccdd39ec109025',
  },
  SUI_USD: {
    type: 'pyth',
    chain: 'ethereum',
    address: '0x4305fb66699c3b2702d4d05cf36551390a4c69c6',
    assetId: '0x23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744',
  },
  WIF_USD: {
    type: 'pyth',
    chain: 'arbitrum',
    address: '0xff1a0f4744e8582df1ae09d5611b887b6a12925c',
    assetId: '0x4ca4beeca86f0d164160323817a4e42b10010a724c2217c6ee41b54cd4cc61fc',
  },
};
