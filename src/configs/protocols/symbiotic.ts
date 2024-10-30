import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SymbioticCollateralPool {
  address: string;
  token: string;
}

export interface SymbioticProtocolConfig extends ProtocolConfig {
  chain: string;
  defaultCollaterals: Array<SymbioticCollateralPool>;
}

export const SymbioticConfigs: SymbioticProtocolConfig = {
  protocol: ProtocolNames.symbiotic,
  category: ProtocolCategories.restaking,
  birthday: 1717459200, // Tue Jun 04 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  defaultCollaterals: [
    {
      address: '0xC329400492c6ff2438472D4651Ad17389fCb843a',
      token: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    },
    {
      address: '0xB26ff591F44b04E78de18f43B46f8b70C6676984',
      token: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
    },
    {
      address: '0x422F5acCC812C396600010f224b320a743695f85',
      token: '0xa2e3356610840701bdf5611a53974510ae27e2e1',
    },
    {
      address: '0x03Bf48b8A1B37FBeAd1EcAbcF15B98B924ffA5AC',
      token: '0xae78736cd615f374d3085123a210448e74fc6393',
    },
    {
      address: '0x475D3Eb031d250070B63Fa145F0fCFC5D97c304a',
      token: '0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa',
    },
    {
      address: '0x38B86004842D3FA4596f0b7A0b53DE90745Ab654',
      token: '0xf951E335afb289353dc249e82926178EaC7DEd78',
    },
    {
      address: '0x5198CB44D7B2E993ebDDa9cAd3b9a0eAa32769D2',
      token: '0xac3e018457b222d93114458476f3e3416abbe38f',
    },
    {
      address: '0x5198CB44D7B2E993ebDDa9cAd3b9a0eAa32769D2',
      token: '0xA35b1B31Ce002FBF2058D22F30f95D405200A15b',
    },
    {
      address: '0xe39B5f5638a209c1A6b6cDFfE5d37F7Ac99fCC84',
      token: '0x57e114B691Db790C35207b2e685D4A43181e6061',
    },
    {
      address: '0x19d0D8e6294B7a04a2733FE433444704B791939A',
      token: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497',
    },
    {
      address: '0x971e5b5D4baa5607863f3748FeBf287C7bf82618',
      token: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    },
    {
      address: '0x0C969ceC0729487d264716e55F232B404299032c',
      token: '0x18084fba666a33d37592fa2633fd49a74dd93a88',
    },
    {
      address: '0xB09A50AcFFF7D12B7d18adeF3D1027bC149Bad1c',
      token: '0x8c1BEd5b9a0928467c9B1341Da1D7BD5e10b6549',
    },
    {
      address: '0x52cB8A621610Cc3cCf498A1981A8ae7AD6B8AB2a',
      token: '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
    },
    {
      address: '0x21DbBA985eEA6ba7F27534a72CCB292eBA1D2c7c',
      token: '0xFe0c30065B384F05761f15d0CC899D4F9F9Cc0eB',
    },
    {
      address: '0x940750A267c64f3BBcE31B948b67CD168f0843fA',
      token: '0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0',
    },
    {
      address: '0x9c0823d3a1172f9ddf672d438dec79c39a64f448',
      token: '0x8236a87084f8b84306f72007f36f2618a5634494',
    },
  ],
};
