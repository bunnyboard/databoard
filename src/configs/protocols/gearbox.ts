import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface GearboxV3Config {
  liquidityPools: Array<string>;
  creditManagers: Array<string>;
}

export interface GearboxPoolConfig {
  chain: string;
  birthday: number;
  v3Configs: GearboxV3Config;
}

export interface GearboxProtocolConfig extends ProtocolConfig {
  pools: Array<GearboxPoolConfig>;
}

export const GearboxConfigs: GearboxProtocolConfig = {
  protocol: ProtocolNames.gearbox,
  birthday: 1702771200, // Sun Dec 17 2023 00:00:00 GMT+0000
  pools: [
    {
      chain: ChainNames.ethereum,
      birthday: 1702771200, // Sun Dec 17 2023 00:00:00 GMT+0000
      v3Configs: {
        liquidityPools: [
          '0xda00000035fef4082F78dEF6A8903bee419FbF8E',
          '0xda00010eDA646913F273E10E7A5d1F659242757d',
          '0xda0002859B2d05F66a753d8241fCDE8623f26F4f',
          '0x1DC0F3359a254f876B37906cFC1000A35Ce2d717',
          '0x4d56c9cBa373AD39dF69Eb18F076b7348000AE09',
          '0xe7146F53dBcae9D6Fa3555FE502648deb0B2F823',
          '0x05A811275fE9b4DE503B3311F51edF6A856D936e',
          '0x8EF73f036fEEC873D0B2fd20892215Df5B8Bdd72',
        ],
        creditManagers: [
          // '0x3eb95430fdb99439a86d3c6d7d01c3c561393556',
          // '0xea7c28428d3916dbe2f113b8a6e6dd0f3819c050',
          // '0x4e94cd228ef386ebc32900ec745d1865934688a3',
          '0xefc134755aaf89fe84476946251680bece41246e',
          '0x46709ca16b1ffea5d6c6bb6b7e77dd9e3b4908ed',
          '0xcac3e41b9bad20e2aa35e150de96eefb2d043735',
          '0xa30099925b14b00b76ae2efe2639cd01598fe68a',
          '0x3f11758aca3f2eb7a27828c9cbcd0b347944ac14',
          '0x0b2486355e987586c32fc0feefe2943e396c484e',
          '0x1d489ccd2b96908c0a80acbbdb2f1963ffed3384',
          '0x6dc0eb1980fa6b3fa89f5b29937b9baab5865b3e',
          '0x50ba483272484fc5eebe8676dc87d814a11faef6',
          '0x6950f4190aa1e1339519d5d4d89796ae4165cd5c',
          '0x58c8e983d9479b69b64970f79e8965ea347189c9',
          '0x4582411643f9bbe6c736ed2114eda856b1c9ed40',
          '0xe35eb22a349baba4f1a28a9cdba641d3b72c6203',
          '0x629f097996a5fb606470974bda1c3b6abc4d6857',
        ],
      },
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1708992000, // Tue Feb 27 2024 00:00:00 GMT+0000
      v3Configs: {
        liquidityPools: [
          '0xa76c604145D7394DEc36C49Af494C144Ff327861',
          '0x04419d3509f13054f60d253E0c79491d9E683399',
          '0x890A69EF363C9c7BdD5E36eb95Ceb569F63ACbF6',
        ],
        creditManagers: [
          '0x75bc0fef1c93723be3d73b2000b5ba139a0c680c',
          '0xb4bc02c0859b372c61abccfa5df91b1ccaa4dd1f',
          '0xcedaa4b4a42c0a771f6c24a3745c3ca3ed73f17a',
          '0x3ab1d35500d2da4216f5863229a7b81e2f6ff976',
          '0xe5e2d4bb15d26a6036805fce666c5488367623e2',
          '0xb780dd9cec259a0bbf7b32587802f33730353e86',
        ],
      },
    },
    {
      chain: ChainNames.optimism,
      birthday: 1712448000, // Sun Apr 07 2024 00:00:00 GMT+0000
      v3Configs: {
        liquidityPools: ['0x5520dAa93A187f4Ec67344e6D2C4FC9B080B6A35', '0x42dB77B3103c71059F4b997d6441cFB299FD0d94'],
        creditManagers: [
          '0xab260a0acbee82db69e61221a57aff302a2a83d9',
          '0xbd71b3e744a0f9a6f8405479118ff2f42118463a',
          '0x1c1261bbccd09cb618d3fd8cd74bf7562c022ac4',
          '0x6ed2150a2d4136b42adf2043d25f5834baa0f1a9',
        ],
      },
    },
  ],
};
