import { ChainNames, ProtocolNames } from '../names';
import { GauntletProtocolConfig } from './gauntlet';

export const SteakhouseConfigs: GauntletProtocolConfig = {
  protocol: ProtocolNames.steakhouse,
  birthday: 1704326400, // Thu Jan 04 2024 00:00:00 GMT+0000
  curators: [
    {
      chain: ChainNames.ethereum,
      birthday: 1704326400, // Thu Jan 04 2024 00:00:00 GMT+0000
      morphoVaults: [
        '0xBEEF01735c132Ada46AA9aA4c54623cAA92A64CB',
        '0xBEeFFF209270748ddd194831b3fa287a5386f5bC',
        '0xBeEf11eCb698f4B5378685C05A210bdF71093521',
        '0xbEef047a543E45807105E51A8BBEFCc5950fcfBa',
        '0xBEEf050ecd6a16c4e7bfFbB52Ebba7846C4b8cD4',
        '0xbEeFc011e94f43b8B7b455eBaB290C7Ab4E216f1',
        '0xbEEF02e5E13584ab96848af90261f0C8Ee04722a',
        '0x7204B7Dbf9412567835633B6F00C3Edc3a8D6330',
        '0x6D4e530B8431a52FFDA4516BA4Aadc0951897F8C',
        '0xA0804346780b4c2e3bE118ac957D1DB82F9d7484',
        '0xBeeF7959aE71D4e45e1863dae0B94C35244AF816',
        '0x833AdaeF212c5cD3f78906B44bBfb18258F238F0',
        '0xA1b60d96e5C50dA627095B9381dc5a46AF1a9a42',
        '0x30881Baa943777f92DC934d53D3bFdF33382cab3',
        '0x097FFEDb80d4b2Ca6105a07a4D90eB739C45A666',
        '0xbeeFfF68CC520D68f82641EFF84330C631E2490E',
        '0xbEEFC01767ed5086f35deCb6C00e6C12bc7476C1',
        '0xbeEf094333AEdD535c130958c204E84f681FD9FA',
        '0xBeEf796ae50ba5423857CAc27DD36369cfc8241b',
        '0x75741A12B36D181f44F389E0c6B1E0210311e3Ff',
        '0xa5aA40F27DAeDE9748822ef836170f202e196B5A',
      ],
      eulerVaults: [],
    },
    {
      chain: ChainNames.base,
      birthday: 1717200000, // Sat Jun 01 2024 00:00:00 GMT+0000
      morphoVaults: [
        '0xbeeF010f9cb27031ad51e3333f9aF9C6B1228183',
        '0xBeEF086b8807Dc5E5A1740C5E3a7C4c366eA6ab5',
        '0xbEefc4aDBE58173FCa2C042097Fe33095E68C3D6',
        '0xBEef03f0BF3cb2e348393008a826538AaDD7d183',
        '0xBEeFA28D5e56d41D35df760AB53B94D9FfD7051F',
        '0xbEEf050a7485865A7a8d8Ca0CC5f7536b7a3443e',
        '0xbEEfa1aBfEbE621DF50ceaEF9f54FdB73648c92C',
        '0xB17B070A56043e1a5a1AB7443AfAFDEbcc1168D7',
      ],
      eulerVaults: [],
    },
  ],
};
