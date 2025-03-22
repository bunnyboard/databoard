import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface PendleChainConfig {
  chain: string;
  birthday: number;
  markets: Array<string>;
}

export interface PendleProtocolConfig extends ProtocolConfig {
  chains: Array<PendleChainConfig>;
}

export const PendleConfigs: PendleProtocolConfig = {
  protocol: ProtocolNames.pendle,
  birthday: 1669248000, // Thu Nov 24 2022 00:00:00 GMT+0000
  chains: [
    {
      chain: ChainNames.ethereum,
      birthday: 1669248000, // Thu Nov 24 2022 00:00:00 GMT+0000
      markets: [
        '0xfb8f489df4e04609f4f4e54f586f960818b70041',
        '0xc374f7ec85f8c7de3207a10bb1978ba104bda3b2',
        '0x7e9ad57d949b7ae03588a5bcba85016f76b462f7',
        '0x9a76925dd91a7561b58d8353f0bce4df1e517abb',
        '0xe84b47e626c8dcc021a585a059819cc54946f95a',
        '0xb15a55519dbc3d770dded079ebcdeeea69a49ade',
        '0xcf756c00a755172bdc073787ea83817603da42ef',
        '0xd547d9c74314f787affc587d101146e1663d046e',
        '0x7b246b8dbc2a640bf2d8221890cee8327fc23917',
        '0x44474d98d1484c26e8d296a43a721998731cf775',
        '0x54e28e62ea9e8d755dc6e74674eabe2abfdb004e',
        '0x9ec4c502d989f04ffa9312c9d6e3f872ec91a0f9',
        '0xabc8ae339e3f560bf700a3f6ee85ee719979762b',
        '0x2ec8c498ec997ad963969a2c93bf7150a1f5b213',
        '0xc9becdbc62efb867cb52222b34c187fb170379c6',
        '0x1806855b73881ed4e435c97c6da58b01be5d7390',
        '0x23aefced9255ad3560cdaa4a10cbfe9ec230dc5a',
        '0xa5fd0e8991be631917d2d2b2d5dacfd7bfef7876',
        '0x8225dd26ddfaaa321e5388e0f4c090ba16217c21',
        '0xcb71c2a73fd7588e1599df90b88de2316585a860',
        '0xd0354d4e7bcf345fb117cabe41acadb724eccca2',
        '0x30e0dc9a1d33eac83211a1113de238b3ce826950',
        '0x0eb3f11ed8ca69813744868d02d83d4fbf72841e',
        '0x5546d0f27bed4075ea03a22c58f7016e24c94ea7',
        '0xd1434df1e2ad0cb7b3701a751d01981c7cf2dd62',
        '0x34280882267ffa6383b363e278b027be083bbe3b',
        '0xd16cb4138a0f09885defdbc1fe4a65a8f2fb3950',
        '0x62187066fd9c24559ffb54b0495a304ade26d50b',
        '0xfcbae4635ca89866f83add208ecceec742678746',
        '0x93a82f3873e5b4ff81902663c43286d662f6721c',
        '0xb089c87f41bf37afdd71280660ffed15e3162ff8',
        '0xff262396f2a35cd7aa24b7255e7d3f45f057cdba',
        '0xcf89d9e82a021167945d3af67b2343111d1d3eb9',
        '0x565e5283385b64aa1883cbde44fd35e14752742e',
        '0xc112b12addc11f988abc1aafb47e4c2f62fb6070',
        '0xbeef0acd30d146f8ac4ca6665d672727b943f105',
        '0x0e1c5509b503358ea1dac119c1d413e28cc4b303',
        '0xc8edd52d0502aa8b4d5c77361d4b3d300e8fc81c',
        '0xcdbd5ff3e03b6828db9c32e2131a60aba5137901',
        '0x1e0c2e41f3165ff6b8a660092f63e10bc0eebe26',
        '0x4bafdf5932c3f39288fe8ff5e6e40641debdb3ca',
        '0xe02c61247185883f499bd834250093d6bca0db77',
        '0xde715330043799d7a80249660d1e6b61eb3713b3',
        '0xcaa8abb72a75c623bece1f4d5c218f425d47a0d0',
        '0xe8802f3683bbeb15c10c2c06b3b723ae744a43f1',
        '0x90c98ab215498b72abfec04c651e2e496ba364c0',
        '0x4803a036c4352bd53906b1c70040fa271d3afe65',
        '0xb8fbf5cc2826c1c9909f59dd11633b494f46fbfe',
        '0xf68300929df14d933eba2d45917563d5ed065666',
        '0x1d83fdf6f019d0a6b2babc3c6c208224952e42fc',
        '0x7d372819240d14fb477f17b964f95f33beb4c704',
        '0x464f5a15aca6fe787cf54fcf1e8af6207939d297',
        '0x2a41384c28b3e327beda4ffb3d3706cad571d5fb',
        '0x3b621df9b429ed1ad64428ea7d8d142374c45121',
        '0xa96febd6c5faf7739d3149bfb43211ec6844a37c',
        '0x51f8c81ab9709e90cc4830c6f4ab9830f7462dd6',
        '0x00b321d89a8c36b3929f20b7955080baed706d1b',
        '0x038c1b03dab3b891afbca4371ec807edaa3e6eb6',
        '0xd3bb297264bd6115ae163db4153038a79d78acba',
        '0xb4460e76d99ecad95030204d3c25fb33c4833997',
        '0x107a2e3cd2bb9a32b9ee2e4d51143149f8367eba',
        '0x905a5a4792a0c27a2adb2777f98c577d320079ef',
        '0xd8072f2084f5876d6ec25c423ea71edc0469cce5',
        '0xbbd395d4820da5c89a3bca4fa28af97254a0fcbe',
        '0xf32e58f92e60f4b0a37a69b95d642a471365eae8',
        '0xe6d4986cd935529fc4505d48e926bcd36a58a0f0',
        '0xe26d7f9409581f606242300fbfe63f56789f2169',
        '0x445d25a1c31445fb29e65d12da8e0eea38174176',
        '0x1bcbdb8c8652345a5acf04e6e74f70086c68fefc',
        '0xb1f587b354a4a363f5332e88effbbc2e4961250a',
        '0x18bafcabf2d5898956ae6ac31543d9657a604165',
        '0x8f7627bd46b30e296aa3aabe1df9bfac10920b6e',
        '0xd7e0809998693fd87e81d51de1619fd0ee658031',
        '0xbce250b572955c044c0c4e75b2fa8016c12cabf9',
        '0x386f90eb964a477498b528a39d9405e73ed4032b',
        '0x6b4740722e46048874d84306b2877600abcea3ae',
        '0xa54fc268101c8b97de19ef3141d34751a11996b2',
        '0xe1f19cbda26b6418b0c8e1ee978a533184496066',
        '0x2084b373979415bc93190071af3390f92dcdd189',
        '0x9c73879f795cefa1d5239de08d1b6aba2d2d1434',
        '0x1729981345aa5cacdc19ea9eeffea90cf1c6e28b',
        '0xbae2df4dfcd0c613018d6056a40077f2d1eff28a',
        '0x6c269dfc142259c52773430b3c78503cc994a93e',
        '0x99184849e35d91dd85f50993bbb03a42fc0a6fe7',
        '0xee6bdfac6767efef0879b924fea12a3437d281a2',
        '0xf148a0b15712f5bfeefadb4e6ef9739239f88b07',
        '0x4f43c77872db6ba177c270986cd30c3381af37ee',
        '0x17be998a578fd97687b24e83954fec86dc20c979',
        '0xd1d7d99764f8a52aff007b7831cc02748b2013b5',
        '0x19588f29f9402bb508007feadd415c875ee3f19f',
        '0xd8f12bcde578c653014f27379a6114f67f0e445f',
        '0x38100a480dbed278b0fe57ba80a75498a7dc5bb1',
        '0xa9355a5d306c67027c54de0e5a72df76befa5694',
        '0x403829bce022844f66cdb2911d2260526d4eb843',
        '0xa183754f09af59fa1e0b5b9e32b9dea91b6dc0a3',
        '0xa0ab94debb3cc9a7ea77f3205ba4ab23276fed08',
        '0x077dffdadf5fa9037254e4e30b138e67ed4e156a',
        '0x8a49f2ac2730ba15ab7ea832edac7f6ba22289f8',
        '0xbbf399db59a845066aafce9ae55e68c505fa97b7',
        '0x3d1e7312de9b8fc246dded971ee7547b0a80592a',
        '0x2801b56f6ccc8046ae29e86c0fce556e046122e2',
        '0x9e27d0787b9554a1d734f60bd1365adaf1ac298c',
        '0x020aba13e46baa0ddcbab4505fabad697e223908',
        '0x901e710c2f634131b36e3c68b072ed5db9250f3e',
        '0x3fd77572fe52b37779fe88529956bf34777cbd2b',
        '0xb9e8bb1105382b018c6adfd95fd9272542cc1776',
        '0x84a50177a84dad50fdbf665dfbfb39914b52dff2',
        '0x70b70ac0445c3ef04e314dfda6caafd825428221',
        '0xa1073303f32de052643faff61d90858e33b4e033',
        '0x7e0209ab6fa3c7730603b68799bbe9327dab7e88',
        '0x890b6afc834c2a2cc6cb9b6627272ab4ecfd8271',
        '0x1c5b54c0bd500a7430ed34bd2413af17725a7840',
        '0x409b499780ac04dc4780f9b79fbede665ac773d5',
        '0xdbe4d359d4e48087586ec04b93809ba647343548',
        '0x6c06bbfa3b63ed344ceb3312df795edc8d29bdd5',
        '0x6010676bc2534652ad1ef5fa8073dcf9ad7ebfbe',
        '0x7e0f3511044afdad9b4fd5c7fa327cbeb90beebf',
        '0x1c48cd1179aa0c503a48fcd5852559942492e31b',
        '0x67ec4046800bc2c27a51528e9d382d43c3146d29',
        '0x8539b41ca14148d1f7400d399723827a80579414',
        '0x12f6139a5dc6d80990d30a4d45bb86449ff804d8',
        '0xa0d9e9a4b8c472583d761241cadc6cb7f8960c70',
        '0x21d85ff3bedff031ef466c7d5295240c8ab2a2b8',
        '0x523f9441853467477b4dde653c554942f8e17162',
        '0x07c5b1f5265591a8e0e541466654b07dd2d1a6fd',
        '0x3fd13bad9fc47e001bf9088afd1a1b2fc24673d5',
        '0x380c751bd0412f47ca560b6afeb566d88dc18630',
        '0xd3c29550d12a5234e6aeb5aea7c841134cd6ddd5',
        '0x81f3a11db1de16f4f9ba8bf46b71d2b168c64899',
        '0x22a72b0c504cbb7f8245208f84d8f035c311adec',
        '0x46e6b4a950eb1abba159517dea956afd01ea9497',
        '0xebf5c58b74a836f1e51d08e9c909c4a4530afd41',
        '0x931f7ea0c31c14914a452d341bc5cb5d996be71d',
        '0xc387ad871d94990e073f1bd0b759ffdb5e0313aa',
        '0xf4cf59259d007a96c641b41621ab52c93b9691b1',
        '0x02f67a8e59b79891ae0c4c4debcb332d644512e1',
        '0x08946d1070bab757931d39285c12fef4313b667b',
        '0x15e434c42ab4c9a62ed7db53baaf9d255ea51e0e',
        '0x9471d9c5b57b59d42b739b00389a6d520c33a7a9',
        '0x83916356556f51dcbcb226202c3efeefc88d5eaa',
        '0xdfaab89058daca36759aafa80bebbc6dbf4c2e4e',
        '0x86d27c49a6a7a2bc033b5d67a21f93d62894ccb9',
        '0xedda7526ec81055f2af99d51d968fc2fbca9ee96',
        '0x1c3ba40210fa290de13c62fe1a9efcb694725d10',
        '0x6612117db3ce1e604baba304bdf33e52b83a6b1c',
        '0x1c71752a6c10d66375702aafad4b6d20393702cf',
        '0xe45d2ce15abba3c67b9ff1e7a69225c855d3da82',
        '0x4d7356369273c6373e6c5074fe540cb070acfe6b',
        '0x247dd07c1f12c1517056bbff24a152efa9b09073',
        '0x2c71ead7ac9ae53d05f8664e77031d4f9eba064b',
        '0x8098b48a1c4e4080b30a43a7ebc0c87b52f17222',
        '0x3dc05f96160bdf70cf23989a632c087ebc022f92',
        '0xf8208fb52ba80075af09840a683143c22dc5b4dd',
        '0xafdc922d0059147486cc1f0f32e3a2354b0d35cc',
        '0x048680f64d6dff1748ba6d9a01f578433787e24b',
        '0x7561c5ccfe41a26b33944b58c70d6a3cb63e881c',
        '0x2d8f5997af9bc7ae4047287425355518ef01fcfc',
        '0x9b7dbfb30534da9f57f42201e9484d4c09c95c19',
        '0x928e2e42f3b21c9af0e0454d7bb3884e5d36e1be',
        '0x9df192d13d61609d1852461c4850595e1f56e714',
        '0x88437746bfd045b5dfbf15075437aa37e9715f68',
        '0xdd24e2308f0d8f25ce23fa917b43b1eec5a8df0f',
        '0xb6b2cf977c512bcd195b58e2ccfb3fb15535cb19',
        '0xbba9baaa6b3107182147a12177e0f1ec46b8b072',
        '0x58612beb0e8a126735b19bb222cbc7fc2c162d2a',
        '0xbe8549a20257917a0a9ef8911daf18190a8842a4',
        '0x36d3ca43ae7939645c306e26603ce16e39a89192',
        '0x8e1c2be682b0d3d8f8ee32024455a34cc724cf08',
        '0x925cd38a68993819eef0138a463308c840080f17',
        '0x353d0b2efb5b3a7987fb06d30ad6160522d08426',
        '0xa25f5ed89e6e7b3d23ebaf067a30ac3d550a19c1',
        '0x373dc7be84fadebc2e879c98289fc662c6985946',
        '0x887f62e4189c6b04cc6db1478fb71976fd1e84bf',
        '0x40deae18c3ce932fdd5df1f44b54d8cf3902787b',
        '0x2bf616c236d1abd31ff105247a774e6e738b5f4e',
        '0x99b633a6a2e0d6414e7c7ecea1134c0a330a73fe',
        '0xc90013c832926d977ab4cc6876f16c4b8dde3028',
        '0x09fa04aac9c6d1c6131352ee950cd67ecc6d4fb9',
        '0xc118635bcde024c5b01c6be2b0569a2608a8032c',
        '0xe6b03f3182692db1ed7d3a91f6fadf3e4dff2b95',
        '0xb451a36c8b6b2eac77ad0737ba732818143a0e25',
        '0xcdd26eb5eb2ce0f203a84553853667ae69ca29ce',
        '0x3f7ad6c6a882c5c2add1f37dc5739098d4ac9d99',
        '0xb9b7840ec34094ce1269c38ba7a6ac7407f9c4e3',
        '0x1cc737792167e1898246a66008adb2d00b2d0262',
        '0x64506968e80c9ed07bff60c8d9d57474effff2c9',
        '0xfd482179ddee989c45eab19991852f80ff31457a',
        '0xff694cc3f74e080637008b3792a9d7760cb456ca',
        '0x792b9ede7a18c26b814f87eb5e0c8d26ad189780',
        '0xc211b207e3324cf9c501d6f3fb77ffd77a3c82c9',
        '0x461cd9222e130d1dc0bd79dab4643952430937c1',
        '0xcae62858db831272a03768f5844cbe1b40bb381f',
        '0x3c46d1264fe5a25ba2dc082d89ca3e91b2b8681a',
        '0xf6906f99e2ce8cf2d7098216da87e261b13554c8',
        '0xa745ece257fe98a97c2b52e63788d4908cb20c03',
        '0x85667e484a32d884010cf16427d90049ccf46e97',
        '0xab182e2a98234db8298565f0eb9327206b558c57',
        '0xcba3b226ca62e666042cb4a1e6e4681053885f75',
        '0x1fcd0bf3e005d71937e9210eb182f453f46d2f40',
        '0x9e612ff1902c5feea4fd69eb236375d5299e0ffc',
        '0x7509b6bdb9e6dbf6c4b054434dcb46c40000303b',
        '0x1bd1ae9d7a377e63cd0c584a2c42b8c614937e81',
        '0x40789e8536c668c6a249af61c81b9dfac3eb8f32',
        '0xb162b764044697cf03617c2efbcb1f42e31e4766',
        '0xeb4d3057738b9ed930f451be473c1ccc42988384',
        '0x02972d8f8d0e9b82138f3cfddd3fb64dc548692f',
        '0x5d0fdf779bd77b6fb8a813e655a159ed60032483',
        '0x1c1b087b612c541658e7008f56e02a75f99c91cb',
        '0xbdb8f9729d3194f75fd1a3d9bc4ffe0dde3a404c',
        '0x9e388401e2effbef5a5d4ddce0c44fea03d50c69',
        '0x5b6c23aedf704d19d6d8e921e638e8ae03cdca82',
        '0x0ab305033592e16db7d8e77d613f8d172a76ddc9',
        '0x0dfd8cb34cedff77aa3ac1953ff09c0f99fbd5ad',
        '0x98ffefd1a51d322c8def6d0ba183e71547216f7f',
        '0xfd5cf95e8b886ace955057ca4dc69466e793fbbe',
        '0x977ebf77581f94de969349549ab2108a681e8f4c',
        '0xd75fc2b1ca52e72163787d1c370650f952e75dd7',
        '0xd3719a10991b6ca2cd32de536d6e81ccd46e9c02',
        '0xff81180a7f949ba1f940eae6aa3b3ceb890b1912',
        '0xe6df8d8879595100e4b6b359e6d0712e107c7472',
        '0x35a18cd59a214c9e797e14b1191b700eea251f6a',
        '0xad016c9565a4aeec6d4cfc8a01c648ecbea1a602',
        '0x82d810ededb09614144900f914e75dd76700f19d',
        '0xc64056237c8107ecb9860cbd4519644e9ba2aed4',
        '0x487e1cef7805cf0225dec3dd0f3044fe0fb70611',
        '0x580e40c15261f7baf18ea50f562118ae99361096',
        '0x676106576004ef54b4bd39ce8d2b34069f86eb8f',
        '0x7c7fbb2d11803c35aa3e283985237ad27f64406b',
      ],
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1687996800, // Thu Jun 29 2023 00:00:00 GMT+0000
      markets: [
        '0x080f52a881ba96eee2268682733c857c560e5dd4',
        '0x66317dec4a3d8d1e47b85f704e5df675a68bb7c9',
        '0xeda1d0e1681d59dea451702963d6287b844cb94c',
        '0xb2eea27af50030a445418553c4892065cf3a720a',
        '0x27255f9aff1868a8efb1182471f4de2121946fd0',
        '0x9daa2878a8739e66e08e7ad35316c5143c0ea7c7',
        '0x2a880c8a723caaebc4917c01493123b90b5a1241',
        '0x0921CcC98956B1599003Fd9739d5e66BF319A161',
        '0x1d9D27f0b89181cF1593aC2B36A37B444Eb66bEE',
      ],
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1677024000, // Wed Feb 22 2023 00:00:00 GMT+0000
      markets: [
        '0xc85910daf21367cc293eb82876d094c31583b0b7',
        '0xa0192f6567f8f5dc38c53323235fd08b318d2dca',
        '0x0a21291a184cf36ad3b0a0def4a17c12cbd66a14',
        '0xf617792ea9dceb2208f4c440258b21d2f3fdb9a3',
        '0x7d49e5adc0eaad9c027857767638613253ef125f',
        '0xc8fd1f1e059d97ec71ae566dd6ca788dc92f36af',
        '0x0f249f735647992572eea231fc24b35f7b6b34e1',
        '0x65819e4ee91923499934c86e93357f633033cb0b',
        '0x9bc62257ffe7d0f7c52a019e6fc0af3102f8f44e',
        '0x8036762bcc01704949e8995eb6c7c85aca155e20',
        '0x49d17188916291ff2b9cc54009112c8285e4e97c',
        '0xb7ffe52ea584d2169ae66e7f0423574a5e15056f',
        '0x26f10da086519da50c9af663aadcbdd96e2b308b',
        '0x87c8d1b2ed18545594cb0417ac2d3c2974a10912',
        '0xfd8aee8fcc10aac1897f8d5271d112810c79e022',
        '0x14fbc760efaf36781cb0eb3cb255ad976117b9bd',
        '0x83db132a36874090ec5da86bfad1c891e4708373',
        '0x3803d89c31de8b7def55c86f2469a5ea4db41b92',
        '0xe59a37f7f5263aa8cb5155af3498ba01cc2c394b',
        '0x1c3330f1886d8b7eec8af75c66fb6fd6ccbe28b5',
        '0x24e4df37ea00c4954d668e3ce19ffdcffdec2cf6',
        '0x0be708c78166183f12de9afa134fd091f26d4210',
        '0x6ea328bf810ef0f0bd1291eb52f1529aa073cefa',
        '0x7db02aae965f2ca59d6e18112e277780d64e390d',
        '0x08a152834de126d2ef83d612ff36e4523fd0017f',
        '0x1797e0d7fb5038195b39d1760d7364463a047317',
        '0x9f003fd08d5317dfd988bd1ee151b27836fe6c3d',
        '0x2dfaf9a5e4f293bceede49f2dba29aacdd88e0c4',
        '0xe11f9786b06438456b044b3e21712228adcaa0d1',
        '0x6febb4d63f6715793107db9214e9e88dc3e7c3bd',
        '0x58f50de493b6be3585558f95f208de489c296e24',
        '0x6abe9ac2df48490693bdb9d66fa898fc9cd7cc36',
        '0xcf602767e9c82194daf58eb67a3169d60dbaac62',
        '0x1d38d4204159aa5e767afba8f76be22117de61e5',
        '0x60712e3c9136cf411c561b4e948d4d26637561e7',
        '0x99ed4f0ab6524d26b31d0aea087ebe20d5949e0f',
        '0x0d29182b7b663a967c5c41f03fc478c075fd4a1e',
        '0xaccd9a7cb5518326bed715f90bd32cdf2fec2d14',
        '0x766ffd36125ce45bdfca913517ecf25a828996b4',
        '0xe9e114d1b119bbdeb7a35e1ce3c82db01622ada2',
        '0x98534c9f1323dc09efdba86794a557244a5c6dba',
        '0x07fa8f8d7f7969520955ee3e8a45fbed451b43fa',
        '0xe530341f12a41c9b6c69ff378e97794589e31119',
        '0x06f3e4dd4ed20d5f1c9097da9c9488fbd47cc79c',
        '0xcb0be770cc1409a3705d3ca63516244f1bfa8b64',
        '0x75d026762262e904ac5995de5e554766dae609f7',
        '0x6acacf8dc9d489aa83dbd4390bbe1163d2585e70',
        '0x8621c587059357d6c669f72da3bfe1398fc0d0b5',
        '0xf9f9779d8ff604732eba9ad345e6a27ef5c2a9d6',
        '0x35f3db08a6e9cb4391348b0b404f493e7ae264c0',
        '0xed99fc8bdb8e9e7b8240f62f69609a125a0fbf14',
        '0x99e9028e274feafa2e1d8787e1ee6de39c6f7724',
        '0x875f154f4ec93255beaea9367c3adf71cdcb4cc0',
        '0xba4a858d664ddb052158168db04afa3cff5cfcc8',
        '0x5e03c94fc5fb2e21882000a96df0b63d2c4312e2',
        '0x551c423c441db0b691b5630f04d2080caee25963',
        '0x6f02c88650837c8dfe89f66723c4743e9cf833cd',
        '0x952083cde7aaa11ab8449057f7de23a970aa8472',
        '0x6ae79089b2cf4be441480801bb741a531d94312b',
        '0xe0c9b504241a757b4465dd0562e6780da75598bc',
        '0x77198965565e945f1b7ba02d39b1fb49510c83ed',
        '0xf065c7a9100e7b22fa6488ad85ce09323b8ca8f5',
        '0x2ad746fa3faa0ad586021a633d10f4e2785a0349',
        '0x2fb73d98b1d60b35fd12508933578098f352ce7e',
        '0xb4781463a1261f60fca37732efa510c22dec5ada',
        '0x5f3c781b3a20299db27c8fc5f4415d895677c885',
        '0xa5aa12ddee47fdcd1e7a5e149e83a71ab94b3f2a',
        '0x279b44e48226d40ec389129061cb0b56c5c09e46',
        '0x8c2afc4eddb23cfdcc62a8aac14633d456a91477',
        '0xa877a0e177b54a37066c1786f91a1dab68f094af',
        '0x526c73e0ba9cedb44546da4506eaee0b39be8d76',
        '0x1237dcbdd8771580b6e1f709a40a2167f8e35ca0',
        '0xa9104b8b6698979568852c30231871e28a482b3c',
        '0x0d56fb4dab6f876281c0d399c13ff4588dfe0d78',
        '0xe4e535fa577afa6f297e1a4adee0c7819c9fb151',
        '0xcb471665bf23b2ac6196d84d947490fd5571215f',
        '0x2fc3432c0e6a325d09d16f1af14061ec6cf71e98',
        '0x6b92feb89ed16aa971b096e247fe234db4aaa262',
        '0x8cab5fd029ae2fbf28c53e965e4194c7260adf0c',
        '0x816f59ffa2239fd7106f94eabdc0a9547a892f2f',
        '0xbf5e60ddf654085f80dae9dd33ec0e345773e1f8',
        '0x3e4e3291ed667fb4dee680d19e5702ef8275493d',
        '0x4505ec38982bb796b34d050ca8d765acff1abdee',
        '0xf1de71573ee482f13ae4dcf980e83bfaba8b233d',
        '0x22e0f26320ace985e3cb2434095f18bfe114e28e',
        '0xcaf560681233b54c996ba06c71566fd30f32c973',
        '0x86aacbed3e7b3d33149d5dcfd2def3c6d8498b8b',
        '0xaceee1ae91bc2f9244d699aa11b8a591f88b3778',
        '0x281fe15fd3e08a282f52d5cf09a4d13c3709e66d',
        '0x0bd6890b3bb15f16430546147734b254d0b03059',
        '0xbc00832ebe76422321fdd0f3ca90bae9b4e05256',
        '0xc0cda2d5d4d75544cdf01ef69b1e5e56ea366d17',
        '0x3be83cc235455ae1b624cf6e326505769ad8f9ea',
        '0x9ff912568eb011d719b5f4e940f8135633f4bcdc',
        '0xd0fdb5ee558b3bcd9e5bc1344b28b2249de6559c',
      ],
    },
    {
      chain: ChainNames.optimism,
      birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
      markets: ['0x24fb77c8c776c75f869bc65e6856af56f57d919f', '0x0c485feb9e6fee816652ea8f3bed2a8f59296e40'],
    },
    {
      chain: ChainNames.sonic,
      birthday: 1739577600, // Sat Feb 15 2025 00:00:00 GMT+0000
      markets: [
        '0x30d30b975025835869541e4fca35ec4964eb992e',
        '0x6e4e95fab7db1f0524b4b0a05f0b9c96380b7dfa',
        '0xd14117baf6ec5d12be68cd06e763a4b82c9b6d1d',
        '0xf3a090cd118d8762b1bf7e4e5805463ecab622ff',
        '0xa9d3f83bd1a172e96c77bf7e695e664d2e58fa39',
        '0x3f5ea53d1160177445b1898afbb16da111182418',
        '0x4e82347bc41cfd5d62cef483c7f0a739a8158963',
        '0x3aef1d372d0a7a7e482f465bc14a42d78f920392',
        '0x9700c4c218237550ead3a78022d43215a717e5e7',
        '0x4a54c1eb9125a5e3de8cc44f618db45055952674',
      ],
    },
    {
      chain: ChainNames.mantle,
      birthday: 1711497600, // Wed Mar 27 2024 00:00:00 GMT+0000
      markets: [
        '0x27dd857cff9226f79673b6ae6210eb0aa062541c',
        '0xdbdd0c0be8f4d82ae5331f9dc5ca4ef5bcec78c3',
        '0x4ce86d665aafaa04ee171b10cbb3ad497ff938a9',
        '0xdb7c92c84687a00ee0ce81c0bbb56b93fe952e8b',
        '0x7dc07c575a0c512422dcab82ce9ed74db58be30c',
        '0x918600d9526629b2301dc302784cf4892a497bec',
        '0x2ddd4808fbb2e08b563af99b8f340433c32c8cc2',
        '0x99e83709846b6cb82d47a0d78b175e68497ea28b',
        '0x257c15da854bbec7398928859b80b10a156dd433',
        '0xf4e4226d3ba3426b93ef74db9a34452d45ca4c25',
        '0x4604fc1c52cbfc38c4e6dfd2cd2a9bf5b84f65cb',
        '0x0b923f8039ae827e963fcc1b48ab5b903d01925b',
        '0xec3fb79d229ef53c8b5cd64c171097ffc8a00dc5',
      ],
    },
    {
      chain: ChainNames.berachain,
      birthday: 1738972800, // Sat Feb 08 2025 00:00:00 GMT+0000
      markets: ['0xfd6eb71bd81d3745afa6ca740d5ba7f007726212'],
    },
    {
      chain: ChainNames.base,
      birthday: 1732147200, // Thu Nov 21 2024 00:00:00 GMT+0000
      markets: [
        '0x7ed2a3c3712989113723f591cb7deffca0b91d99',
        '0xd4c55616ff73fa137e4c5cdfb10f999d1c3384d9',
        '0x3124d41708edbdc7995a55183e802e3d9d0d5ef1',
        '0xd94fd7bceb29159405ae1e06ce80e51ef1a484b0',
        '0x94530611066b75803812f7938fd54ffcbfe31720',
        '0x727cebacfb10ffd353fc221d06a862b437ec1735',
        '0xe15578523937ed7f08e8f7a1fa8a021e07025a08',
        '0x2b40f7c4281ad4e1da2031f0e309773c186c91b8',
        '0x483f2e223c58a5ef19c4b32fbc6de57709749cb3',
        '0x8c8a79d14a70df7ba11988725ab57b3021c648dc',
        '0xecc2c994aa0c599a7f69a7cfb9106fe4dffb4341',
        '0xcde9e211462f5d253fac3661d314309057c1abd0',
        '0x14936c9b8eb798ca6291c2d6ce5de2c6cb5f1f9c',
        '0x621d4d92e9bed484e6d2cb8a37d342c804a0908c',
      ],
    },
  ],
};
