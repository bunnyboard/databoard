import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface FuelBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;

  // hold bridge ERC20 tokens
  fuelErc20Bridge: string;

  // hold ETH deposit
  fuelBridge: string;

  // previous ETh - ERC20 deposits
  fuelPreDeposit: string;

  supportedTokens: Array<string>;
}

export const FuelNativeBridgeConfigs: FuelBridgeProtocolConfig = {
  protocol: ProtocolNames.fuelNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1720051200, // Thu Jul 04 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.fuel,
  fuelBridge: '0xAEB0c00D0125A8a788956ade4f4F12Ead9f65DDf',
  fuelErc20Bridge: '0xa4cA04d02bfdC3A2DF56B9b6994520E69dF43F67',
  fuelPreDeposit: '0x19b5cc75846bf6286d599ec116536a333c4c2c14',
  supportedTokens: [
    '0x8cdf550c04bc9b9f10938368349c9c8051a772b6',
    '0x4041381e947CFD3D483d67a25C6aa9Dc924250c5',
    '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
    '0x8c9532a60e0e7c6bbd2b2c1303f63ace1c3e9811',
    '0x7a56e1c57c7475ccf742a1832b028f0456652f97',
    '0xd9d920aa40f578ab794426f5c90f6c731d159def',
    '0x3f24E1d7a973867fC2A03fE199E5502514E0e11E',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
    '0xf469fbd2abcd6b9de8e169d128226c0fc90a012e',
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
    '0xa1290d69c65a6fe4df752f95823fae25cb99e5a7',
    '0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa',
    '0x9D39A5DE30e57443BfF2A8307A4256c8797A3497',
    '0x4c9edd5852cd905f086c759e8383e09bff1e68b3',
    '0xae78736cd615f374d3085123a210448e74fc6393',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0xc96de26018a54d51c097160568752c4e3bd6c364',
    '0xa2e3356610840701bdf5611a53974510ae27e2e1',
  ],
};
