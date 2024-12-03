import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface EigenLayerStrategyConfig {
  address: string;
  token: string;
}

export interface EigenLayerProtocolConfig extends ProtocolConfig {
  chain: string;
  birthblock: number;
  strategyManager: string;
  delegationManager: string;
  podManager: string;
  strategies: Array<EigenLayerStrategyConfig>;
}

export const EigenLayerConfigs: EigenLayerProtocolConfig = {
  protocol: ProtocolNames.eigenlayer,
  birthday: 1686355200, // Sat Jun 10 2023 00:00:00 GMT+0000
  birthblock: 17445565,
  chain: ChainNames.ethereum,
  strategyManager: '0x858646372CC42E1A627fcE94aa7A7033e7CF075A',
  delegationManager: '0x39053D51B77DC0d36036Fc1fCc8Cb819df8Ef37A',
  podManager: '0x91E677b07F7AF907ec9a428aafA9fc14a0d3A338',
  strategies: [
    {
      address: '0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc',
      token: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
    },
    {
      address: '0x93c4b944D05dfe6df7645A86cd2206016c51564D',
      token: '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
    },
    {
      address: '0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2',
      token: '0xae78736cd615f374d3085123a210448e74fc6393',
    },
    {
      address: '0x9d7eD45EE2E8FC5482fa2428f15C971e6369011d',
      token: '0xA35b1B31Ce002FBF2058D22F30f95D405200A15b',
    },
    {
      address: '0x13760F50a9d7377e4F20CB8CF9e4c26586c658ff',
      token: '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
    },
    {
      address: '0xa4C637e0F704745D182e4D38cAb7E7485321d059',
      token: '0x856c4Efb76C1D1AE02e20CEB03A2A6a08b0b8dC3',
    },
    {
      address: '0x57ba429517c3473B6d34CA9aCd56c0e735b94c02',
      token: '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
    },
    {
      address: '0x0Fe4F44beE93503346A3Ac9EE5A26b130a5796d6',
      token: '0xf951E335afb289353dc249e82926178EaC7DEd78',
    },
    {
      address: '0x7CA911E83dabf90C90dD3De5411a10F1A6112184',
      token: '0xa2e3356610840701bdf5611a53974510ae27e2e1',
    },
    {
      address: '0x8CA7A5d6f3acd3A7A8bC468a8CD0FB14B6BD28b6',
      token: '0xac3e018457b222d93114458476f3e3416abbe38f',
    },
    {
      address: '0xAe60d8180437b5C34bB956822ac2710972584473',
      token: '0x8c1BEd5b9a0928467c9B1341Da1D7BD5e10b6549',
    },
    {
      address: '0x298aFB19A105D59E74658C4C334Ff360BadE6dd2',
      token: '0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa',
    },
    {
      address: '0xaCB55C530Acdb2849e6d4f36992Cd8c9D50ED8F7',
      token: '0x83e9115d334d248ce39a6f36144aeab5b3456e75',
    },

    // deployed from factory
    {
      address: '0x8feb56c8802bda01f3cc1802d44f6cb469ac9b22',
      token: '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497',
    },
    {
      address: '0x73a18a6304d05b495ecb161dbf1ab496461bbf2e',
      token: '0x8457CA5040ad67fdebbCC8EdCE889A335Bc0fbFB',
    },
    {
      address: '0x99a05f4e3fa886a5104630e8a4b01159867ad9a1',
      token: '0x6982508145454ce325ddbe47a25d4ec3d2311933',
    },
    {
      address: '0x1fc0db099e3452b6c20027578ca57722815df98f',
      token: '0x18084fba666a33d37592fa2633fd49a74dd93a88',
    },
    {
      address: '0x6c6e8af98a49bbabcc17ca1dba6b95c5d58a2ccb',
      token: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    },
    {
      address: '0x752c665ae29bf52f3a162a944ae26882d03321e3',
      token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    },
    {
      address: '0x01f3be8090c3f3a273c9cd598d8cfc94854a45dd',
      token: '0x853d955acef822db058eb8505911ed77f175b99e',
    },
    {
      address: '0xc9ad499c11677ea3815984295dd73c0858757b8e',
      token: '0x3B50805453023a91a8bf641e279401a0b23FA6F9',
    },
    {
      address: '0x71cb984bbcbae0e85c8d59db131246fa694e100d',
      token: '0x6b175474e89094c44da98b954eedeac495271d0f',
    },
    {
      address: '0x505241696ab63faec03ed7893246de52eb1a8cff',
      token: '0x004e9c3ef86bc1ca1f0bb5c7662861ee93350568',
    },
    {
      address: '0x0858616b1a07b7c925ba7e8f9a33475887db3a36',
      token: '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
    },
    {
      address: '0x66ea956907f7ed2fd816106f2f4d8c384c6d4f92',
      token: '0xba50933c268f567bdc86e1ac131be072c6b0b71a',
    },
    {
      address: '0xad855d1e5dbbffcbf3249209da28beb9a8259ffe',
      token: '0xc96de26018a54d51c097160568752c4e3bd6c364',
    },
    {
      address: '0xa553a8198e0692b4393ac2f64bd2e42a2061c1c5',
      token: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    },
    {
      address: '0xa553a8198e0692b4393ac2f64bd2e42a2061c1c5',
      token: '0x8236a87084f8b84306f72007f36f2618a5634494',
    },
    {
      address: '0x74acf103148e183c87ed24ae1d2b3b2c6654fc0a',
      token: '0x7a56e1c57c7475ccf742a1832b028f0456652f97',
    },
  ],
};
