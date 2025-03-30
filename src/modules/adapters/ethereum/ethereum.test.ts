import { expect, test } from 'vitest';
import BitcoreService from '../../../services/blockchains/bitcore';
import BlockchainService from '../../../services/blockchains/blockchain';
import OracleService from '../../../services/oracle/oracle';
import EthereumAdapter from './ethereum';
import { MemcacheService } from '../../../services/caching/memcache';
import DatabaseService from '../../../services/database/database';
import { DefaultMemcacheTime } from '../../../configs';
import { EthereumConfigs } from '../../../configs/protocols/ethereum';

const blockchain = new BlockchainService();
const bitcore = new BitcoreService();
const oracle = new OracleService(blockchain);

const memcache = new MemcacheService(DefaultMemcacheTime);
const database = new DatabaseService();

const ethereumAdapter = new EthereumAdapter(
  {
    blockchain: {
      evm: blockchain,
      bitcore: bitcore,
    },
    oracle: oracle,
  },
  {
    database: database,
    memcache: memcache,
  },
  EthereumConfigs,
);

test('should get ethereum block data correctly', async function () {
  const rawBlockData = await ethereumAdapter.getRawBlockData(EthereumConfigs.publicRpcs[0], 21860229);

  expect(rawBlockData).not.equal(null);

  if (rawBlockData) {
    expect(rawBlockData.block).not.equal(undefined);
    expect(rawBlockData.receipts).not.equal(undefined);

    const blockMetrics = ethereumAdapter.transformBlockData(rawBlockData.block, rawBlockData.receipts);

    expect(blockMetrics.totalTxns).equal(211);
    expect(blockMetrics.totalFee).equal('24703831603122290');
    expect(blockMetrics.totalFeeBurn).equal('13541241498324771');
    expect(blockMetrics.gasLimit).equal('35999828');
    expect(blockMetrics.gasUsed).equal('17107937');
    expect(blockMetrics.totaBeaconlDeposited).equal('32000000000000000000');
    expect(blockMetrics.totaBeaconlWithdrawn).equal('306939943000000000');
  }
});
