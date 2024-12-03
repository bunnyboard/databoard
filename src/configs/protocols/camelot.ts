import { ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

export const CamelotConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.camelot,
  birthday: 1667520000, // Fri Nov 04 2022 00:00:00 GMT+0000
  chains: [
    // {
    //   chain: ChainNames.arbitrum,
    //   dexes: [
    //     {
    //       chain: ChainNames.arbitrum,
    //       version: Pool2Types.univ2,
    //       factory: '0x6EcCab422D763aC031210895C81787E87B43A652',
    //       birthday: 1667520000, // Fri Nov 04 2022 00:00:00 GMT+0000
    //       feeRateForLiquidityProviders: 0.0018, // 0.18%
    //       feeRateForProtocol: 0.0012, // 0.12%
    //       wrappedNative: PublicAddresses.arbitrum.weth,
    //     },
    //   ],
    // },
  ],
};
