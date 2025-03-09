import { ChainNames, ProtocolNames } from '../names';
import { GauntletProtocolConfig } from './gauntlet';

export const MevcapitalConfigs: GauntletProtocolConfig = {
  protocol: ProtocolNames.mevcapital,
  birthday: 1721865600, // Thu Jul 25 2024 00:00:00 GMT+0000
  curators: [
    {
      chain: ChainNames.ethereum,
      birthday: 1721865600, // Thu Jul 25 2024 00:00:00 GMT+0000
      morphoVaults: [
        '0xd63070114470f685b75B74D60EEc7c1113d33a3D',
        '0x59D9571A54593a5EC47d6A20837D96745ECF5C37',
        '0x9a8bC3B04b7f3D87cfC09ba407dCED575f2d61D8',
        '0x2f1aBb81ed86Be95bcf8178bA62C8e72D6834775',
        '0x98cF0B67Da0F16E1F8f1a1D23ad8Dc64c0c70E0b',
        '0x749794E985Af5a9A384B9cEe6D88DaB4CE1576A1',
        '0x1c530D6de70c05A81bF1670157b9d928e9699089',
        '0x1265a81d42d513Df40d0031f8f2e1346954d665a',
        '0xfbDEE8670b273E12b019210426E70091464b02Ab',
        '0x225C119fFaf1CaddCfCDb493283eDF4b816Bf773',
      ],
      eulerVaults: [
        '0xe2D6A2a16ff6d3bbc4C90736A7e6F7Cc3C9B8fa9',
        '0xE3ea69f8661FFac04E269f99C14ba73e2Bb10633',
        '0xe00A44e1210BAe0EACEeeaF202c349d4B16480FE',
        '0x01d1a1cd5955B2feFb167e8bc200A00BfAda8977',
      ],
    },
    {
      chain: ChainNames.sonic,
      birthday: 1738627200, // Tue Feb 04 2025 00:00:00 GMT+0000
      morphoVaults: [],
      eulerVaults: [
        '0x0806af1762Bdd85B167825ab1a64E31CF9497038',
        '0xB38D431e932fEa77d1dF0AE0dFE4400c97e597B8',
        '0x05d57366B862022F76Fe93316e81E9f24218bBfC',
        '0xa5cd24d9792F4F131f5976Af935A505D19c8Db2b',
        '0x196F3C7443E940911EE2Bb88e019Fd71400349D9',
        '0x9144C0F0614dD0acE859C61CC37e5386d2Ada43A',
        '0x6f2Ab32A6487A2996c74Ed2b173dFDF3d5EEDB58',
        '0x1cDA7E7B2023C3f3c94Aa1999937358fA9D01Aab',
        '0xeeaaB5c863f4b1c5356aF138F384AdC25Cb70Da6',
      ],
    },
  ],
};
