import { ProtocolConfig } from '../../types/base';
import { ProtocolNames } from '../names';

export interface DodoexRouterConfig {
  chain: string;
  birthday: number;
  endday?: number; // stop getting data from this day
  address: string;
}

export interface DodoexProtocolConfig extends ProtocolConfig {
  routers: Array<DodoexRouterConfig>;
}

const DodoexRouters: Array<string> = [
  // chain:address:birthday:endday

  // ethereum
  'ethereum:0xa2398842f37465f89540430bdc00219fa9e4d28a:1625270400:1693526400',
  'ethereum:0x50f9bde1c76bba997a5d6e7fefff695ec8536194:1671062400',
  'ethereum:0x21b9f852534fb9ddc3a0a7b24f067b50d8ac9a99:1674000000',
  'ethereum:0x5977F12664b4E634dFbAAD0ad4a6a81057254dA8:1725235200',
  'ethereum:0xa356867fDCEa8e71AEaF87805808803806231FdC:1726790400',
  'ethereum:0xFe837A3530dD566401d35beFCd55582AF7c4dfFC:1611705600',

  // arbitrum
  'arbitrum:0x3B6067D4CAa8A14c63fdBE6318F27A0bBc9F9237:1630368000:1689379200',
  'arbitrum:0x88cbf433471a0cd8240d2a12354362988b4593e5:1630368000',
  'arbitrum:0xe05dd51e4eb5636f4f0e8e7fbe82ea31a2ecef16:1671062400:1728518400',
  'arbitrum:0xc4a1a152812de96b2b1861e433f42290cdd7f113:1685145600:1728518400',
  'arbitrum:0x056FcE6B76AF3050F54B71Fc9B5fcb7C387BfC1A:1726790400',
  'arbitrum:0x69716e51e3f8bec9c3d4e1bb46396384ae11c594:1726790400',

  // avalanche
  'avalanche:0x409E377A7AfFB1FD3369cfc24880aD58895D1dD9:1640131200:1689379200',
  'avalanche:0x3a64Ec3606FF7310E8fAd6FcC008e39705fB496d:1726790400',
  'avalanche:0x8b09DB11ea380d6454D2592D334FFC319ce6EF3E:1726790400',

  // bnbchain
  'bnbchain:0x6B3D817814eABc984d51896b1015C0b89E9737Ca:1622764800:1689379200',
  'bnbchain:0x8f8dd7db1bda5ed3da8c9daf3bfa471c12d58486:1613520000',
  'bnbchain:0x0656fd85364d03b103ceeda192fb2d3906a6ac15:1671062400',
  'bnbchain:0x0343C5757Fb98aD9eF39824e08B852aF61C71c64:1726790400',
  'bnbchain:0x701Ac6fAD7850956f966a85655348ac1B7c93368:1726790400',

  // base
  'base:0x3A7Bc5F9E41356728f037f17D88c642EE46d1Aaa:1726790400',
  'base:0x8b09DB11ea380d6454D2592D334FFC319ce6EF3E:1726790400',

  // linea
  'linea:0x70B9C57E1fF24761C1C3ced57Ddae9A3F3570698:1691539200',
  'linea:0x03e89fc55a5ad0531576e5a502c4ca52c8bf391b:1691539200',

  // manta
  'manta:0x2933c0374089D7D98BA0C71c5E02E1A0e09deBEE:1698192000',
  'manta:0x200D866Edf41070DE251Ef92715a6Ea825A5Eb80:1698192000',

  // mantle
  'mantle:0x70B9C57E1fF24761C1C3ced57Ddae9A3F3570698:1700006400',
  'mantle:0xB4E598688eC724DD00a8944E7c7b259BbB992c61:1700006400',

  // optimism
  'optimism:0x7950dC01542eFE1c03aea610472e3b565B53f64a:1650326400:1689292800',
  'optimism:0xfd9d2827ad469b72b69329daa325ba7afbdb3c98:1659614400:1689422400',
  'optimism:0x716fcc67dca500a91b4a28c9255262c398d8f971:1671105600:1728518400',
  'optimism:0x3a64Ec3606FF7310E8fAd6FcC008e39705fB496d:1726790400',
  'optimism:0x8b09DB11ea380d6454D2592D334FFC319ce6EF3E:1726790400',

  // polygon
  'polygon:0xa222e6a71d1a1dd5f279805fbe38d5329c1d0e70:1621296000',
  'polygon:0x2fa4334cfd7c56a0e7ca02bd81455205fcbdc5e9:1623110400:1705968000',
  'polygon:0x39e3e49c99834c9573c9fc7ff5a4b226cd7b0e63:1671062400',
  'polygon:0xa103206e7f19d1c1c0e31efc4dfc7b299630f100:1685145600:1723075200',
  'polygon:0x3a64Ec3606FF7310E8fAd6FcC008e39705fB496d:1726790400',
  'polygon:0x46AFE01D758a46d64c7d8E0791314D5db3E2e683:1726790400',

  // scroll
  'scroll:0x4e998615ad430c1ca46a69d813ede6eb3ec55edb:1697587200',
  'scroll:0xf0512872fEc0173d1d99c2dd8CDCb770054b675b:1697587200',
];

export const DodoexConfigs: DodoexProtocolConfig = {
  protocol: ProtocolNames.dodoex,
  birthday: 1625270400, // Sat Jul 03 2021 00:00:00 GMT+0000
  routers: DodoexRouters.map((config) => {
    const [chain, address, birthday, endday] = config.split(':');

    return {
      chain,
      address,
      birthday: Number(birthday),
      endday: endday ? Number(endday) : undefined,
    };
  }),
};
