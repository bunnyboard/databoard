// get all Gmx v2 markets
import BlockchainService from '../services/blockchains/blockchain';
import { decodeEventLog } from 'viem';
import GmxEventEmitterAbi from '../configs/abi/gmx/EventEmitter.json';
import fs from 'fs';
import OracleService from '../services/oracle/oracle';
import { getTimestamp } from '../lib/utils';
import { GmxMarketV2Config } from '../configs/protocols/gmx';

const Transactions: Array<string> = [
  'arbitrum:0x8421bfe6f90cb4715b184ab13d3f1a0df8b413bae0e076fa2d9591f66c6ebc53',
  'arbitrum:0x80ef8c8a10babfaad5c9b2c97d0f4b0f30f61ba6ceb201ea23f5c5737e46bc36',
  'arbitrum:0x19a0f23c4a4f3c932664171336e0207a07a275a929c3a124755276b7f789f382',
  'arbitrum:0x30fa870e8c153b5e94701297d8c87f75cd6c92d1bee5b162a3543638408ca3a1',
  'arbitrum:0x092f90b524f55983d788fb6b525aade72f4777c4896c0428b2393527f4e4db8c',
  'arbitrum:0xb408fed6009da89125214643ffa13497afc459b4d7e10cfa7c632f232bda367f',
  'arbitrum:0x1a7c06be1bcb7d8927104314c4b6a3f4a41c5589b92c79dc8a413e6d6e0cac88',
  'arbitrum:0x465a300657a0d316f92b225d1f61698db87a2d1889252488ee5a66bf33ca538b',
  'arbitrum:0x7758e5ff6bec78bec60328b1a5d2f719b47d9eb1859d8ccc1095176370c4394e',
  'arbitrum:0x0a7726e1e881ac0dc4cae253147117f0268fb639bd61076858dd3da7e72e1a0f',
  'arbitrum:0x462470e7529bfc0ff898b5cb24c7ea9a056c3c422510be562ad6bc0d3d594ac1',
  'arbitrum:0x93dbfec9c353671eec2fc40a66e31e5054e3859e76fcdc96f47af9eb3d6777e7',
  'arbitrum:0x76e6aab2be25d0d177c6442b0f7363fd465d4cbda36f90c78f04c80acf3935ad',
  'arbitrum:0xd4510dbddf46bf4c90edc95d541091b194541927fe2204847e4e29d3bbd28e3a',
  'arbitrum:0x35c967587609cb218e710f4a85c5b400f662833528d3ef13c560f3515bdee149',
  'arbitrum:0x3181322326b9914a6f9b0cde89c86d66eb205e70514363cb07f5c79ea2aff746',
  'arbitrum:0x91e0cad936cd104035d16d18f72baa7126e34ab1cd445a9767abfae2f46ed94a',
  'arbitrum:0x8035db0ea32b8e6018c92ff48f8d23d99d1b1af03947eee6a1df7b105f8cce5c',
  'arbitrum:0x427c7ca74bef97155e09cd11e96b92f682d1b1fc56c6c8756840fcf8c97e7ae7',
  'arbitrum:0x5a77cb385acf748a13ca46048126188e4f63b94bc766fd15f496a93b90c396c9',
  'arbitrum:0x23f5fd700a0409e93d548591df211d66f59fd0dbfbf31a17616e91c541e52db5',
  'arbitrum:0x968966f660b3c9c4c0a446013cb9684ea84bf5e2c4098ebcf89a145f911af4d3',
  'arbitrum:0xb9cb3229075eb4a9bdc206e3c58c874f8139e8a30a2cb7f14506e98d25475daa',
  'arbitrum:0xe42cc1747146fc7033e7096f37a7e711eab4a376dd71549431955af33c779cb8',
  'arbitrum:0x9483ca56d6b91e288f271add90da87467e1d68b5f08ff62b19b46a2232639c46',
  'arbitrum:0x8ee03d9e7d335b4758dfaf36a0dd153019137305db8ed6e2f78e42d2afb23625',
  'arbitrum:0xc8e7de252354ad7492b50ff6e0975af9339ca7d8150d0983db721f1e12bb3621',
  'arbitrum:0x38b22c466817259f949862f4dc0adba545987dacf73d26707d364744074a3a7f',
  'arbitrum:0x8af04638f291b2788df5d5ba7d8d204082be787a7c732011de73b3390faca578',
  'arbitrum:0xd638d1210405c0d9093caceb00c247ea81b7be256a76ce47f6dedceea053212a',
  'arbitrum:0x8c4e6a6f1c9b9c34358a90accee5f16e692fe5876a2e33280f0976faf5f3c7b1',
  'arbitrum:0x420a33c3f794285b24b26649c16596225c370b50306925b8c75d02aca892d193',
  'arbitrum:0xafa6c5f05b8fdc809e173ec339fb48efef032726061ac7ee4893ac024de30d01',
  'arbitrum:0x77f6ae007c20de4ae76f7851bc8d97ad52ec4c0cc293ec89194050163809593d',
  'arbitrum:0xd675170af1eafe2faefd34f5ce804df5eabd0b55e717a1e4afed406568f9cea2',
  'arbitrum:0x2effa4fb1ab91d1906f633024981498f838be53d24d9fe1a87d61e0c0c7ca992',
  'arbitrum:0x6998ccdaa860dbc3de56de9f7485dde58ce1ec364d10adf9b0ecca8840e3234e',
  'arbitrum:0x9776959e7f3f526e9c781e7b457ae94aefead0ab1566a1c909180c79d89e9d6b',
  'arbitrum:0x4d4ea5a0a563829b2a7b660e827b81aadadaee800c47455fba5c79d800024edb',
  'arbitrum:0x93b94471191a85831c6aa2e4971ccd3fee14fcbbd44338f1232fd0655f45846a',
  'arbitrum:0x6079c926110aaea0308d64ad5e10d01f3914f6a1cd51a86658e4188952b325f8',
  'arbitrum:0x3ff33b2626738687594262dfe0e746d8e421fab1d04fbe131d3317b58261ea8a',
  'arbitrum:0x9746160f7e7fd201a4b106b08fa55afc700f34d8e8eb3996d66131afcdabe716',
  'arbitrum:0x6af14d2f68eb27fbec8ffa67c036dbb6001ee7ac7d9b702f142af2b8eeaf5ba0',
  'arbitrum:0xe2faebe342a559738058dc26299bbe0e3fd843b62a85d93307f32a51b163a84d',
  'arbitrum:0xf5f687f533895c6f9a64aecd2d34d45682fbab0e8b91c1d4366945f3301edcfe',
  'arbitrum:0xde10a3eba2e5e423b31b7d4d69058f8b7704c62120456f4b66b4c307a9587a77',
  'arbitrum:0x7517f7fcdfb131e1aa92e447f60c9fe7996200ab9f88c90795137ff657254fe7',
  'arbitrum:0x4e7a778f066ce6a813a48373e8855603fdce6ebc4281fbbd51e598b172e2f7f6',
  'arbitrum:0xef4d7c1dd2589a0d6cf053295fe3ad1db344b52e9207d17a8424eb2217148e60',
  'arbitrum:0xf98076c8cf77c6470c4191d30f5a4fff875e6d4a22acf4ab8a9aefeac6428560',
  'arbitrum:0x2184a3a27bfa9a94d8f6af5f59bcf8b062537b3eb02e1fd30e9133a494d64f80',
  'arbitrum:0x071a2d7f09ee452bc07a49820b3f73743335d584fa2177dd6daaaacecf000412',
  'arbitrum:0x5217bea7b7530c249d4e7e3d1d4ba8b8cda894901eae47d6ac380eb2ec6aa7d0',
  'arbitrum:0xd571d4063a8cd260a354882ee6cd99e8280d13a3fe9bb633607e702b119c3cfc',
  'arbitrum:0x9ffe0970ffc8f8096da9a74f03da667d6e530508bf05526be2688de65eb39932',
  'arbitrum:0x70b8b7c13b97e8b72b2345441297474488229be27ca545daa5f85be9a19cc027',
  'arbitrum:0x3aee787596fb2b6f48901f153acbd382142a039d2a12d98a3169e40c658929cc',
  'arbitrum:0x2f2a776a6200211751a7f2d57deef388d16bf8c30612373d21a5921007f702ce',
  'arbitrum:0x950c6ae04103e8a6e726878c4e46dd76bca9daa006e4e96f7e33b5c46f1e3d69',
  'arbitrum:0x5846e02e92f80ca02c1f4110a8c1f44690840d43abef49506f95e79aaa39c79f',
  'arbitrum:0x4e689c3427f968cd644a608ec1c0dac0e46e7158d080ad2aebc1de7a6fd489f0',
  'arbitrum:0x7c5460a8125bc6967ad184600b361e3c22d8d7c7ffdb9c5d7fb58ec7d406f39e',
  'arbitrum:0xfa510fbe5b1d97b11748624c9b0f4f06b6459c423a71d95384f45a47ee9d7684',
  'arbitrum:0xf38dd219869c77058f1957073af45ce42417eab2c73244739c3d589a1baeb019',
  'arbitrum:0x95a94f581767be8c84feaf001f727a2705c809b763068799024f513f12fb27be',
  'arbitrum:0x8cf527bce322c35c0411e0102d29a825630325044bfb299ba6d89d3a768e964b',
  'arbitrum:0x727938561fe627cbdb49873ec6862e29a8662d222126fce881b570ed5b11443a',
  'arbitrum:0xf4b86f657dd103c29519fa9d4b04cc414b060666e8ec8613d9305bc2ec61a44f',
  'arbitrum:0xce36cbddbd6f26043fc23ae40f929e1041170116bf0a5bb0c61b86b9182274b9',
  'arbitrum:0x050a219f0b7cb3d17c41373c86d356fab42912cd92b7c5a6f9215db3ede1ac8f',
  'arbitrum:0x2d9f18b940284d02be8241f6197932dafe7e75cc5cb7a3b04ca1b52216734cf7',
  'arbitrum:0x0ce5918911ab5bd30476b4efabfdcca2c407e30e3643a0e7f47829b37ebb3b8d',
  'arbitrum:0x3cf10a000e90f1e29b40cd8a93f5654da4659fb600a36b3eacbc997634db3a1e',
  'arbitrum:0x1202af5594c68ec8cb92901de7da5b20ee255da544ac63f7f861b58ee66c0cec',
  'arbitrum:0x12261025494a1218724fd0a855e4760f0d50a1c8338d4b0b02568d2f32b4598c',
  'arbitrum:0xe007d14db4976b1d56bed5e26029138ce09957aa737f2c80096030673e3fa1ce',
  'arbitrum:0x59cd16117d455c120e71abfc80e01ce3a2605e54cfb02d591412e7ae3b6fa583',
  'arbitrum:0xf87b1f2605153514bab232dddd653e4aa83a58fe97ac8035a9013b1cc04985dc',
  'arbitrum:0x2cc9f4f34a011a55e13260cb9eade81551fd18ceece9a8113768dbffc28d51d2',
  'arbitrum:0x719280842998f0035d331e69f89c39bd674b3b57229d11f59b4856078f4cf594',
  'arbitrum:0x1168f0b503d4729e158f7802302cb2fa097a3715cc66f7856d30d6104caff6ae',
  'arbitrum:0x4db03b3ebf17b41a57c8ff3645bfb573f5545ddaad6b37ec011891fb965f05b7',
  'arbitrum:0x46a225c9fe3ff774284c4616a8463861dadc9b3ef8f9cbd3e5ea1a89b4b646f6',

  'avalanche:0x6e5fae0ee7865f663989ad7b0a1d99460ba5360e64572982870f5fbbfccbac13',
  'avalanche:0x60e06e6e353d81a3aeb869edcb7e422d56da9990ebd79fc1e64505c4f6eab991',
  'avalanche:0xba664c5090ae4b563f5d374fa1295729fb0106fc47ec5fcfa9f77b7bf1cd1694',
  'avalanche:0x99ed0ff40a31b70d685ed0878d85eb6dd89b8ca81c5ae121513c30342766ba23',
  'avalanche:0x56c0a683df5cb7a3f8c3ecffec60f742d928d5ca17cde25d8bcdb9d6d22fea18',
  'avalanche:0xf1672117ae0f7bf3063b22f6dee350ce896911153f2a7425fc6471e4b905f64f',
  'avalanche:0x1e15c498c346cd9d1e2f2f7421fc3561967beede640b8a26e33ba3b73bcd2036',
  'avalanche:0x36a721d2e0497cadf89e593ceb8f7524f74330a86444e85c2af16dd7cd647b60',
  'avalanche:0x8d4529a84d150c5a3ee852f7114eaa9d6e13fcb023a62a2c088d5c5d5777f1d6',
  'avalanche:0x0e960a74a8f72c9fabdcafc7d518ff0d05cc2cfd2246be0e4147d5f66d227009',
  'avalanche:0xc6f95c09990cdba048b441e49fd5dcbb4846274bd8eb6937c47a75abf4ba4b68',
  'avalanche:0x2f600d18afe9107f094e40bf7144e3a68ebf694bb6447350e90e38a31898d334',
  'avalanche:0x837b9c64679e9ef28edfafb55e1b3b9532f5127d2ed9f86d837093bc44c53c4a',
  'avalanche:0x87621a5f7f0489ae7bf3175cef3e8571f20280d6cfdc0677c7a091c2b920b3b3',
  'avalanche:0x704440baed5b73735ef9e11404ba73327f0b835487d8e32666922d45642b66d6',
  'avalanche:0x22d1d3c8c319828656e4395b0e1bf4e5c94c1c716cd7d7888c76e30e1cdd6dd4',
];

// MarketCreated
const topic0 = '0x137a44067c8961cd7e1d876f4754a5a3a75989b4552f1843fc69c3b372def160';
const topic1 = '0xad5d762f1fc581b3e684cf095d93d3a2c10754f60124b09bec8bf3d76473baaf';

(async function () {
  const markets: Array<GmxMarketV2Config> = [];

  const blockchain = new BlockchainService();
  const oracle = new OracleService(blockchain);
  const timestamp = getTimestamp();
  for (const transaction of Transactions) {
    const [chain, hash] = transaction.split(':');
    const client = blockchain.getPublicClient(chain);
    const receipt = await client.getTransactionReceipt({
      hash: hash as any,
    });

    for (const log of receipt.logs) {
      if (log.topics[0] === topic0 && log.topics[1] === topic1) {
        const event: any = decodeEventLog({
          abi: GmxEventEmitterAbi,
          topics: log.topics,
          data: log.data,
        });

        const eventData: any = event.args.eventData;

        if (event.args.eventName === 'MarketCreated') {
          const market: GmxMarketV2Config = {
            chain: chain,
            birthblock: Number(log.blockNumber),
            marketToken: eventData.addressItems.items[0].value,
            indexToken: eventData.addressItems.items[1].value,
            longToken: eventData.addressItems.items[2].value,
            shortToken: eventData.addressItems.items[3].value,
          };

          markets.push(market);

          await oracle.getTokenPriceUsdRounded({
            chain: chain,
            address: market.longToken,
            timestamp: timestamp,
          });
          await oracle.getTokenPriceUsdRounded({
            chain: chain,
            address: market.shortToken,
            timestamp: timestamp,
          });
        }
      }
    }
  }

  fs.writeFileSync('./src/configs/data/constants/GmxMarkets.json', JSON.stringify(markets));
})();
