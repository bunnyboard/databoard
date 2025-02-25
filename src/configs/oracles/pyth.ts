import { OracleSourcePyth } from '../../types/oracles';

export const OracleSourcePythList: { [key: string]: OracleSourcePyth } = {
  BERA_USD: {
    type: 'pyth',
    chain: 'berachain',
    address: '0x2880ab155794e7179c9ee2e38200202908c17b43',
    assetId: '0x962088abcfdbdb6e30db2e340c8cf887d9efb311b1f2f17b155a63dbb6d40265',
  },
};
