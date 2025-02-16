import BigNumber from 'bignumber.js';

// time
export const TimeUnits = {
  SecondsPerDay: 24 * 60 * 60,
  DaysPerYear: 365,
  SecondsPerYear: 365 * 24 * 60 * 60,
};

// solidity unit
export const SolidityUnits = {
  OneWad: new BigNumber(1e18).toString(10),
  OneRay: new BigNumber(1e27).toString(10),
  OneRad: new BigNumber(1e45).toString(10),
  WadDecimals: 18,
  RayDecimals: 27,
  RadDecimals: 45,

  Uint256MaxValue: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
};

export const AddressZero = '0x0000000000000000000000000000000000000000';
export const AddressOne = '0x0000000000000000000000000000000000000001';
export const AddressE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
export const AddressF = '0xffffffffffffffffffffffffffffffffffffffff';
export const AddressEF = '0xefefefefefefefefefefefefefefefefefefefef';
export const Address455448 = '0x0000000000000000000000000000000000455448'; // starknet native ETH
export const AddressMulticall3 = '0xca11bde05977b3631167028862be2a173976ca11';

export const Erc20TransferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

export const EthereumBeaconDepositContract = '0x00000000219ab540356cbb839cbe05303d7705fa';
export const EthereumBeaconDepositEvent = '0x649bbc62d0e31342afea4e5cd82d4049e7e1ee912fc0889aa790803be39038c5';

export const MockBitcoinAddress = 'bitcoin';

// chain => number of second per block confirmation
export const ChainBlockPeriods: { [key: string]: number } = {
  ethereum: 13, // 13 seconds
  arbitrum: 1, // 1 seconds
  base: 2, // 2 seconds
  bnbchain: 3, // 3 seconds
  optimism: 2, // 2 seconds
  avalanche: 2, // 2 seconds
  fantom: 2, // 2 seconds
  linea: 1, // 1 seconds
  blast: 2, // 2 seconds
  mode: 2, // 2 seconds
  cronos: 5.6, // 5.6 seconds
  scroll: 3, // 3 seconds
  bob: 2, // 2 seconds
  zksync: 1, // 1 seconds
  fraxtal: 1, // 2 seconds
  lisk: 2, // 2 seconds
};

export const EventSignatures = {
  ERC20_Transfer: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
  ERC4626_Deposit: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',
  ERC4626_Withdraw: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
};
