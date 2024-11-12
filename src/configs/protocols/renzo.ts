import { normalizeAddress } from '../../lib/utils';
import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface RenzoProtocolConfig extends ProtocolConfig {
  chain: string;

  ezETH: string;
  restakeManager: string;
  withdrawManager: string;

  // pzETH accept wstETH token deposited into Symbiotic
  pzETH: string;
  wstETH: string;

  // deposit EIGEN
  ezEIGEN: string;
  EIGEN: string;
}

export const RenzoConfigs: RenzoProtocolConfig = {
  protocol: ProtocolNames.renzo,
  category: ProtocolCategories.liquidStaking,
  birthday: 1701820800, // Wed Dec 06 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,

  ezETH: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
  restakeManager: '0x74a09653A083691711cF8215a6ab074BB4e99ef5',
  withdrawManager: '0x5efc9D10E42FB517456f4ac41EB5e2eBe42C8918',

  pzETH: '0x8c9532a60e0e7c6bbd2b2c1303f63ace1c3e9811',
  wstETH: normalizeAddress('0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'),

  ezEIGEN: '0xd4fcde9bb1d746dd7e5463b01dd819ee06af25db',
  EIGEN: normalizeAddress('0xec53bf9167f50cdeb3ae105f56099aaab9061f83'),
};
