import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SymbiosisPortalConfig {
  chain: string;
  birthday: number;
  portal: string;
}

export interface SymbiosisProtocolConfig extends ProtocolConfig {
  portals: Array<SymbiosisPortalConfig>;
}

export const SymbiosisConfigs: SymbiosisProtocolConfig = {
  protocol: ProtocolNames.symbiosis,
  birthday: 1668470400, // Tue Nov 15 2022 00:00:00 GMT+0000
  portals: [
    {
      chain: ChainNames.ethereum,
      birthday: 1668470400, // Tue Nov 15 2022 00:00:00 GMT+0000
      portal: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1681776000, // Tue Apr 18 2023 00:00:00 GMT+0000
      portal: '0x01a3c8e513b758ebb011f7afaf6c37616c9c24d9',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1668470400, // Tue Nov 15 2022 00:00:00 GMT+0000
      portal: '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1668470400, // Tue Nov 15 2022 00:00:00 GMT+0000
      portal: '0xE75C7E85FE6ADd07077467064aD15847E6ba9877',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1668470400, // Tue Nov 15 2022 00:00:00 GMT+0000
      portal: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
    },
    {
      chain: ChainNames.telos,
      birthday: 1670284800, // Tue Dec 06 2022 00:00:00 GMT+0000
      portal: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
    },
    {
      chain: ChainNames.kava,
      birthday: 1675987200, // Fri Feb 10 2023 00:00:00 GMT+0000
      portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    },
    // {
    //   chain: ChainNames.boba,
    //   birthday: 1669766400, // Wed Nov 30 2022 00:00:00 GMT+0000
    //   portal: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
    // },
    // {
    //   chain: ChainNames.bobabnb,
    //   birthday: 1668470400, // Tue Nov 15 2022 00:00:00 GMT+0000
    //   portal: '0xb8f275fBf7A959F4BCE59999A2EF122A099e81A8',
    // },
    {
      chain: ChainNames.zksync,
      birthday: 1701129600, // Tue Nov 28 2023 00:00:00 GMT+0000
      portal: '0x4f5456d4d0764473DfCA1ffBB8524C151c4F19b9',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1682812800, // Sun Apr 30 2023 00:00:00 GMT+0000
      portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    },
    {
      chain: ChainNames.linea,
      birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
      portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    },
    {
      chain: ChainNames.mantle,
      birthday: 1689724800, // Wed Jul 19 2023 00:00:00 GMT+0000
      portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    },
    {
      chain: ChainNames.base,
      birthday: 1693872000, // Tue Sep 05 2023 00:00:00 GMT+0000
      portal: '0xEE981B2459331AD268cc63CE6167b446AF4161f8',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1697500800, // Tue Oct 17 2023 00:00:00 GMT+0000
      portal: '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4',
    },
    {
      chain: ChainNames.manta,
      birthday: 1698796800, // Wed Nov 01 2023 00:00:00 GMT+0000
      portal: '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4',
    },
    {
      chain: ChainNames.metis,
      birthday: 1701475200, // Sat Dec 02 2023 00:00:00 GMT+0000
      portal: '0xd8db4fb1fEf63045A443202d506Bcf30ef404160',
    },
    {
      chain: ChainNames.mode,
      birthday: 1707177600, // Tue Feb 06 2024 00:00:00 GMT+0000
      portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    },
    {
      chain: ChainNames.blast,
      birthday: 1709337600, // Sat Mar 02 2024 00:00:00 GMT+0000
      portal: '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4',
    },
    {
      chain: ChainNames.unichain,
      birthday: 1740009600, // Thu Feb 20 2025 00:00:00 GMT+0000
      portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    },
    {
      chain: ChainNames.berachain,
      birthday: 1738886400, // Fri Feb 07 2025 00:00:00 GMT+0000
      portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    },
    {
      chain: ChainNames.gnosis,
      birthday: 1738368000, // Sat Feb 01 2025 00:00:00 GMT+0000
      portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    },
    {
      chain: ChainNames.abstract,
      birthday: 1738368000, // Sat Feb 01 2025 00:00:00 GMT+0000
      portal: '0x8Dc71561414CDcA6DcA7C1dED1ABd04AF474D189',
    },
    {
      chain: ChainNames.sonic,
      birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
      portal: '0xE75C7E85FE6ADd07077467064aD15847E6ba9877',
    },
    {
      chain: ChainNames.morphl2,
      birthday: 1733270400, // Wed Dec 04 2024 00:00:00 GMT+0000
      portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    },
    {
      chain: ChainNames.bsquared,
      birthday: 1728432000, // Wed Oct 09 2024 00:00:00 GMT+0000
      portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    },
    {
      chain: ChainNames.fraxtal,
      birthday: 1719273600, // Tue Jun 25 2024 00:00:00 GMT+0000
      portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    },
    {
      chain: ChainNames.cronos,
      birthday: 1718323200, // Fri Jun 14 2024 00:00:00 GMT+0000
      portal: '0xE75C7E85FE6ADd07077467064aD15847E6ba9877',
    },
    {
      chain: ChainNames.taiko,
      birthday: 1716854400, // Tue May 28 2024 00:00:00 GMT+0000
      portal: '0x5Aa5f7f84eD0E5db0a4a85C3947eA16B53352FD4',
    },
    // {
    //   chain: ChainNames.merlin,
    //   birthday: 1715126400, // Wed May 08 2024 00:00:00 GMT+0000
    //   portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    // },
    {
      chain: ChainNames.gravity,
      birthday: 1721088000, // Tue Jul 16 2024 00:00:00 GMT+0000
      portal: '0x292fC50e4eB66C3f6514b9E402dBc25961824D62',
    },
  ],
};
