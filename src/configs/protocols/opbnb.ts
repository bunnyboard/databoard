import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig } from './optimism';

export const OpbnbNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.opbnbNativeBridge,
  birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
  chain: ChainNames.bnbchain,
  layer2Chain: ChainNames.opbnb,
  optimismPortal: '0x1876EA7702C0ad0C6A2ae6036DE7733edfBca519',
  optimismGateway: '0xF05F0e4362859c3331Cb9395CBC201E3Fa6757Ea',
  supportedTokens: [
    '0x55d398326f99059ff775485246999027b3197955',
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
    '0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409',
    '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
    '0xa026Ad2ceDa16Ca5FC28fd3C72f99e2C332c8a26',
    '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
  ],
};
