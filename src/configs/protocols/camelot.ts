import { Pool2Types } from '../../types/domains/pool2';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

// https://docs.camelot.exchange/tokenomics/protocol-earnings
export const CamelotConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.camelot,
  birthday: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
  factories: [
    // v2
    {
      chain: ChainNames.arbitrum,
      version: Pool2Types.univ2,
      factory: '0x6EcCab422D763aC031210895C81787E87B43A652',
      factoryBirthblock: 35061163,
      birthday: 1672531200, // Sun Jan 01 2023 00:00:00 GMT+0000
      feeRateForLiquidityProviders: 0.0018, // 60% of 0.3% swap fee -> LP
      feeRateForProtocol: 0.0012, // // 60% of 0.3% swap fee -> protocol
    },

    // v3
    {
      chain: ChainNames.arbitrum,
      version: Pool2Types.algebra,
      factory: '0x1a3c9B1d2F0529D97f2afC5136Cc23e58f1FD35B',
      factoryBirthblock: 101163738,
      birthday: 1686787200, // Thu Jun 15 2023 00:00:00 GMT+0000
      feeRateForProtocol: 0.15, // 15% swap fees
    },
  ],
};
