// import { expect, test } from 'vitest';
// import { UniswapConfigs } from '../../../configs/protocols/uniswap';
// import UniswapSubgraphQuery from './subgraph';
// import OracleService from '../../../services/oracle/oracle';
// import BlockchainService from '../../../services/blockchains/blockchain';
// import BitcoreService from '../../../services/blockchains/bitcore';
// import { SushiConfigs } from '../../../configs/protocols/sushi';

// const blockchain = new BlockchainService();
// const bitcore = new BitcoreService();
// const oracle = new OracleService(blockchain);

// const uniswapSubgraphQuery = new UniswapSubgraphQuery({
//   oracle,
//   blockchain: {
//     evm: blockchain,
//     bitcore: bitcore,
//   },
// });

// test('should query uniswap subgraph data correctly', async function () {
//   const response = await uniswapSubgraphQuery.querySubgraphV2({
//     factoryConfig: UniswapConfigs.factories[0], // uniswap v2
//     params: {
//       factories: 'uniswapFactories',
//       totalVolumeUSD: 'totalVolumeUSD',
//       totalLiquidityUSD: 'totalLiquidityUSD',
//     },

//     blockNumber: 21767716,
//     fromBlock: 21767642,
//     toBlock: 21767716,

//     timestamp: 1736899200,
//     fromTime: 1736899200,
//     toTime: 1736985600,
//   });

//   expect(response).not.equal(null);
//   if (response) {
//     expect(response.liquidityUsd).equal(2078388336.7455323);
//     expect(response.volumeSwapUsd).equal(1733303.8791503906);
//     expect(response.volumeAddLiquidityUsd).equal(26202247.914304987);
//     expect(response.volumeRemoveLiquidityUsd).equal(8986852.360482989);
//   }
// });

// test('should query sushi subgraph data correctly', async function () {
//   const response = await uniswapSubgraphQuery.querySubgraphV2({
//     factoryConfig: SushiConfigs.factories[0], // sushi v2
//     params: {
//       factories: 'uniswapFactories',
//       totalVolumeUSD: 'totalVolumeUSD',
//       totalLiquidityUSD: 'totalLiquidityUSD',
//     },

//     blockNumber: 21767716,
//     fromBlock: 21767642,
//     toBlock: 21767716,

//     timestamp: 1736899200,
//     fromTime: 1736899200,
//     toTime: 1736985600,
//   });

//   expect(response).not.equal(null);
//   if (response) {
//     expect(response.liquidityUsd).equal(122550003.58010285);
//     expect(response.volumeSwapUsd).equal(56497.20391845703);
//     expect(response.volumeAddLiquidityUsd).equal(676.8139136130482);
//     expect(response.volumeRemoveLiquidityUsd).equal(51055.6353184304);
//   }
// });
