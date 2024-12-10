import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface WasabiPoolConfig {
  chain: string;
  birthday: number;
  longPool: string;
  shortPool: string;
  vautls: Array<string>;
}

export interface WasabiProtocolConfig extends ProtocolConfig {
  pools: Array<WasabiPoolConfig>;
}

export const WasabiConfigs: WasabiProtocolConfig = {
  protocol: ProtocolNames.wasabi,
  birthday: 1702944000, // Tue Dec 19 2023 00:00:00 GMT+0000
  pools: [
    {
      chain: ChainNames.ethereum,
      birthday: 1702944000, // Tue Dec 19 2023 00:00:00 GMT+0000
      longPool: '0x8e0EDfD6d15f858AdBb41677B82aB64797D5AfC0',
      shortPool: '0x0fdc7b5ce282763d5372a44b01db65e14830d8ff',
      vautls: [
        '0x7d7bb40f523266b63319bc3e3f6f351b9e389e8f', // long - USDC
        '0x630ed8220f9cbc98358a2e2ecb0727d7b9d61397', // long - WETH
        '0x1831F6b2573e756BFAFDcB121880a80894A61aE2', // short - wSOL
        '0x8E26DAB15e7Af842ACbE030b65808618b50DE32D',
        '0x127d3615A8865812f76FF8f214F9955c3a74820a',
        '0xD2502E8e253A48D229DF0e642A404c5BbfF1c1b4',
        '0xb86510BfDCd229A66f0617162EF1c45dB1ceaBA8',
        '0x34F0A81703C2Ed935a61372188A8f9ff78eDf77D',
        '0x10432BC30396e70F792B538d7e810C83Dd7BFe71',
        '0x8D48b8d948726D4636Aa15A9D6124422f461E153',
        '0x6E9e3baf06dB9265f81e0D6862039569E73b076E',
        '0x8320385030690EE6e95C713F586C2A8f5dd07C18',
        '0x364cB3da96EA3bF24c97c3cD95d59DF7A403A1Ed',
        '0x96c2436AF099de751A812fe32836ee794DDE2020',
        '0x6A46002457b743ce9167Ff5134Fe8DE916f54bFa',
        '0xBAAa2A89a7BeC92a810E0BF96aDF68066BeC5c7d',
        '0x519DB1319f7c4192d1d964a6F932298e76c026af',
        '0x73EBFF4460CA625a59E8c024C333d3501505b8e9',
        '0x630ED8220F9cbc98358a2E2eCb0727D7B9D61397',
        '0x7d7bB40f523266B63319Bc3E3f6F351B9E389e8f',
        '0x4dF48f7abC624aB672d69A18a5fc7bdE5944c8E2',
        '0xB533c682553f518A3961EeEc2bFdc645C60289f0',
        '0x64B02119A901843a6A6d273D40A8C6B9e099c197',
        '0xE29E74b7De69804a536aFfcc995924E9a98F6F4B',
        '0xd7738F10A46Ca13287a10449Dc9e8E8cD5fE2530',
        '0xa4d853b2488aAf2d21D015524BaC691bD019f7a7',
        '0xA4D274FAe648b3e20c3458A9bA2ACEf4b0A8eBf6',
      ],
    },
    {
      chain: ChainNames.blast,
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      longPool: '0x046299143A880C4d01a318Bc6C9f2C0A5C1Ed355',
      shortPool: '0x0301079DaBdC9A2c70b856B2C51ACa02bAc10c3a',
      vautls: [
        '0x8e2b50413a53f50e2a059142a9be060294961e40',
        '0x4bed2a922654cacc2be974689619768fabf24855',
        '0x3ccdbd9336711894126b5f7fc4f26d4547e768ad',
        '0x7274aa6606e7c3afabc6ba3e7e345c03eee7fe81',
        '0x6b4d371a557c2b5987fcbcc7b841819bb919303c',
        '0x5c0f73ced4b7caf05ee46385c548acb77389b5a7',
        '0x7eda4afad0764dbe971ed3e0884ec3196ecacccf',
        '0x237e604e8a946df3332bfa318191d72895f80144',
        '0xba74ab0bdc17d085dae189499e4d23a124d46c1a',
        '0x1e046bc49eeebd0f5633caa9638fe977cfdaf0c8',
        '0xce979f9a3bc1f3bf57d573c653c8f8b0f2d4de4d',
        '0x616afdcc1f2606cde40e556570b608904d103558',
        '0x5ed244e11ecfe3b0f299b5e22f84ae6036a7ac21',
        '0x80d2438ae77fe7761a137b490b297cbe01d4aeaa',
        '0x04ffa5a58a27d94e3364918a1597841b62620519',
        '0x8e2b50413a53f50e2a059142a9be060294961e40',
        '0xffa03410e05d66d4dbe18e31b4ad4f0289b70432',
        '0xb5a09514966e9902df2525bacbd0c86fceacc078',
      ],
    },
  ],
};
