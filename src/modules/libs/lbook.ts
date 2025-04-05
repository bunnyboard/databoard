import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourcePool2 } from '../../types/oracles';
import { compareAddress } from '../../lib/utils';

export interface GetPool2LpPriceUsdOptions {
  chain: string;
  address: string;
  blockNumber: number;
  timestamp: number;
}

export default class LBookLibs {
  public static async getPricePool2(source: OracleSourcePool2, blockNumber: number): Promise<string | null> {
    const blockchain = new BlockchainService();

    const [token0, token1, binStep, activeBin] = await blockchain.multicall({
      chain: source.chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: LBPairAbis,
          target: source.address,
          method: 'getTokenX',
          params: [],
        },
        {
          abi: LBPairAbis,
          target: source.address,
          method: 'getTokenY',
          params: [],
        },
        {
          abi: LBPairAbis,
          target: source.address,
          method: 'getBinStep',
          params: [],
        },
        {
          abi: LBPairAbis,
          target: source.address,
          method: 'getActiveId',
          params: [],
        },
      ],
    });

    if (token0 && token1 && binStep !== null && activeBin !== null) {
      // https://docs.lfj.gg/V2.1/guides/price-from-id
      const price = (1 + Number(binStep) / 10000) ** (Number(activeBin) - 8388608);

      if (compareAddress(source.baseToken.address, token0)) {
        const decimals = source.baseToken.decimals - source.quotaToken.decimals;
        return (price * 10 ** decimals).toString();
      } else if (compareAddress(source.baseToken.address, token1)) {
        const decimals = source.quotaToken.decimals - source.baseToken.decimals;
        return (1 / (price * 10 ** decimals)).toString();
      }
    }

    return null;
  }
}

const LBPairAbis = [
  {
    inputs: [],
    name: 'getTokenX',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getTokenY',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBinStep',
    outputs: [
      {
        internalType: 'uint16',
        name: '',
        type: 'uint16',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getActiveId',
    outputs: [
      {
        internalType: 'uint24',
        name: '',
        type: 'uint24',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
