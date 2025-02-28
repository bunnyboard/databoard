import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface YearnV2VaultListConfig {
  chain: string;
  birthday: number;
  vaultRegistry: string;
  lensOracle: string;
  performanceFeeRate: number;
}

export interface YearnV3VaultListConfig {
  chain: string;
  birthday: number;
  performanceFeeRate: number;
  vaults: Array<string>;
}

export interface YearnProtocolConfig extends ProtocolConfig {
  v2Vaults: Array<YearnV2VaultListConfig>;
  v3Vaults: Array<YearnV3VaultListConfig>;
  yeth: {
    chain: string;
    birthday: number;
    pools: Array<string>;
  };
}

export const YearnConfigs: YearnProtocolConfig = {
  protocol: ProtocolNames.yearn,
  birthday: 1671494400, // Tue Dec 20 2022 00:00:00 GMT+0000
  yeth: {
    chain: ChainNames.ethereum,
    birthday: 1694044800, // Thu Sep 07 2023 00:00:00 GMT+0000
    pools: ['0x0Ca1bd1301191576Bea9b9afCFD4649dD1Ba6822', '0x2cced4ffA804ADbe1269cDFc22D7904471aBdE63'],
  },
  v2Vaults: [
    {
      chain: ChainNames.ethereum,
      birthday: 1671494400, // Tue Dec 20 2022 00:00:00 GMT+0000
      performanceFeeRate: 0.1, // 10%;
      vaultRegistry: '0xaf1f5e1c19cb68b30aad73846effdf78a5863319',
      lensOracle: '0x83d95e0D5f402511dB06817Aff3f9eA88224B030',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1662768000, // Sat Sep 10 2022 00:00:00 GMT+0000
      performanceFeeRate: 0.1, // 10%;
      vaultRegistry: '0x79286Dd38C9017E5423073bAc11F53357Fc5C128',
      lensOracle: '0xB082d9f4734c535D9d80536F7E87a6f4F471bF65',
    },
    {
      chain: ChainNames.base,
      birthday: 1693353600, // Wed Aug 30 2023 00:00:00 GMT+0000
      performanceFeeRate: 0.1, // 10%;
      vaultRegistry: '0xF3885eDe00171997BFadAa98E01E167B53a78Ec5',
      // don't have oracle contract on base blockchain
      // just leave it blank
      lensOracle: '',
    },
  ],
  v3Vaults: [
    {
      chain: ChainNames.ethereum,
      birthday: 1710201600, // Tue Mar 12 2024 00:00:00 GMT+0000
      performanceFeeRate: 0.2, // 20%
      vaults: [
        '0x04AeBe2e4301CdF5E9c57B01eBdfe4Ac4B48DD13',
        '0xe24ba27551abe96ca401d39761ca2319ea14e3cb',
        '0x8670120c32de7bc990e0fe3bbd04704e98492f0a',
        '0x4cE9c93513DfF543Bc392870d57dF8C04e89Ba0a',
        '0xBe53A109B494E5c9f97b9Cd39Fe969BE68BF6204',
        '0x182863131F9a4630fF9E27830d945B1413e347E8',
        '0x09580f2305a335218bdB2EB828387d52ED8Fc2F4',
        '0x310B7Ea7475A0B449Cfd73bE81522F1B88eFAFaa',
        '0x074134A2784F4F66b6ceD6f68849382990Ff3215',
        '0x694E47AFD14A64661a04eee674FB331bCDEF3737',
        '0xAc37729B76db6438CE62042AE1270ee574CA7571',
        '0xeEB6Be70fF212238419cD638FAB17910CF61CBE7',
        '0x028eC7330ff87667b6dfb0D94b954c820195336c',
        '0xBF319dDC2Edc1Eb6FDf9910E39b37Be221C8805F',
        '0x92545bCE636E6eE91D88D2D017182cD0bd2fC22e',
        '0xc56413869c6CDf96496f2b1eF801fEDBdFA7dDB0',
        '0x70E75D8053e3Fb0Dda35e80EB16f208c7e4D54F4',
        '0x57a8b4061AA598d2Bb5f70C5F931a75C9F511fc8',
        '0xb6da41D4BDb484BDaD0BfAa79bC8E182E5095F7e',
        '0xf1ce36c9C0dB95A052Eb4b075BC334e1f5a21Ef0',
        '0xDDa02A2FA0bb0ee45Ba9179a3fd7e65E5D3B2C90',
        '0x57fC2D9809F777Cd5c8C433442264B6E8bE7Fce4',
        '0xe5175a2EB7C40bC5f0E9DE4152caA14eab0fFCb7',
        '0xebF3581407ae0Ceb07B8149b4C3AC995a72cb589',
        '0xb6da41D4BDb484BDaD0BfAa79bC8E182E5095F7e',
      ],
    },
    {
      chain: ChainNames.polygon,
      birthday: 1698364800, // Fri Oct 27 2023 00:00:00 GMT+0000
      performanceFeeRate: 0.2, // 20%
      vaults: [
        '0xA013Fbd4b711f9ded6fB09C1c0d358E2FbC2EAA0',
        '0xBb287E6017d3DEb0e2E65061e8684eab21060123',
        '0x90b2f54C6aDDAD41b8f6c4fCCd555197BC0F773B',
        '0x34b9421Fe3d52191B64bC32ec1aB764dcBcDbF5e',
        '0x305F25377d0a39091e99B975558b1bdfC3975654',
        '0x28F53bA70E5c8ce8D03b1FaD41E9dF11Bb646c36',
      ],
    },
    {
      chain: ChainNames.base,
      birthday: 1732406400, // Sun Nov 24 2024 00:00:00 GMT+0000
      performanceFeeRate: 0.2, // 20%
      vaults: [
        '0xd5428B889621Eee8060fc105AA0AB0Fa2e344468',
        '0xfdB431E661372fA1146efB70bf120ECDed944a78',
        '0x4d81C7d534D703E0a0AECaDF668C0E0253E1f1C3',
        '0xEF34B4Dcb851385b8F3a8ff460C34aDAFD160802',
        '0x03c5AfF0cd5e40889d689fD9D9Caff286b1BD7Fb',
        '0xc3BD0A2193c8F027B82ddE3611D18589ef3f62a9',
        '0x25f32eC89ce7732A4E9f8F3340a09259F823b7d3',
        '0x989381F7eFb45F97E46BE9f390a69c5d94bf9e17',
      ],
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1718841600, // Thu Jun 20 2024 00:00:00 GMT+0000
      performanceFeeRate: 0.2, // 20%
      vaults: [
        '0x9FA306b1F4a6a83FEC98d8eBbaBEDfF78C407f6B',
        '0x1Dd930ADD968ff5913C3627dAA1e6e6FCC9dc544',
        '0x044E75fCbF7BD3f8f4577FF317554e9c0037F145',
        '0x6FAF8b7fFeE3306EfcFc2BA9Fec912b4d49834C1',
        '0xc0ba9bfED28aB46Da48d2B69316A3838698EF3f5',
        '0x7DEB119b92b76f78C212bc54FBBb34CEA75f4d4A',
        '0x2B0B6376083c6E1F376C7439F328436A673F333c',
      ],
    },
  ],
};
