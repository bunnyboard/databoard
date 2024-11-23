import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface OptimismBridgeProtocolConfig extends ProtocolConfig {
  chain: string;

  layer2Chain: string;

  // OptimismPortalProxy
  // portal hold native ETH
  optimismPortal: string;

  // L1StandardBridge
  // gateway hold ERC20 tokens
  // and execute bridge activities
  optimismGateway: string;

  // list of supported bridge tokens
  supportedTokens: Array<string>;
}

// https://github.com/ethereum-optimism/ethereum-optimism.github.io/blob/master/src/defaultTokens.ts
export const OptimismSuperchainTokens = [
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  '0xdac17f958d2ee523a2206206994597c13d831ec7',
  '0x57ab1ec28d129707052df4df418d58a2d46d5f51',
  '0x5f98805a4e8be255a32880fdec7f6728c6568ba0',
  '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  '0x0000000000085d4780B73119b644AE5ecd22b376',
  '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
  '0xbe9895146f7af43049ca1c1ae358b0541ea49704',
  '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
  '0xae78736cd615f374d3085123a210448e74fc6393',
  '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202',
  '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  '0x514910771af9ca656af840dff83e8264ecf986ca',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  '0x0cec1a9154ff802e7934fc916ed7ca50bde6844e',
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
  '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
  '0x8947da500Eb47F82df21143D0C01A29862a8C3c5',
  '0x01ba67aac7f75f647d94220cc98fb30fcc5105bf',
  '0xbC396689893D065F41bc2C6EcbeE5e0085233447',
  '0xba100000625a3754423978a60c9317c58a424e3D',
  '0xD533a949740bb3306d119CC777fa900bA034cd52',
  '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
  '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
  '0x163f8C2467924be0ae7B5347228CABF260318753',
  '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
  '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828',
  '0x6B3595068778DD592e39A122f4f5a5cF09C90fE2',
  '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
  '0x853d955aCEf822Db058eb8505911ED77F175b99e',
  '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
  '0x111111111117dC0aa78b770fA6A738034120C302',
  '0x6033f7f88332b8db6ad452b7c6d5bb643990ae3f',
  '0x9e32b13ce7f2e80a01932b42553652e053d6ed8e',
  '0xf8e57ac2730d3088d98b79209739b0d5ba085a03',
  '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0',
  '0x8457CA5040ad67fdebbCC8EdCE889A335Bc0fbFB',
];

export const OptimismNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.optimismNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1624406400, // Wed Jun 23 2021 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.optimism,
  optimismPortal: '0xbEb5Fc579115071764c7423A4f12eDde41f106Ed',
  optimismGateway: '0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1',
  supportedTokens: OptimismSuperchainTokens,
};
