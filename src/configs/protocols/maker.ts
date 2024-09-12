import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

const MakerGemJoins: Array<string> = [
  // birthday:address:collateral:ilk
  // '1573689600:0x2F0b23f53734252Bda2277357e97e1517d6B042A:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2:0x4554482d41000000000000000000000000000000000000000000000000000000', // ETH-A
  // '1602633600:0x08638eF1A205bE6762A8b935F5da9b700Cf7322c:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2:0x4554482d42000000000000000000000000000000000000000000000000000000', // ETH-B
  // '1615507200:0xF04a5cC80B1E94C69B48f5ee68a08CD2F09A7c3E:0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2:0x4554482d43000000000000000000000000000000000000000000000000000000', // ETH-C
  // '1634428800:0x10CD5fbe1b404B7E19Ef964B63939907bdaf42E2:0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0:0x5753544554482d41000000000000000000000000000000000000000000000000', // wstETH-A
  // '1651190400:0x248cCBf4864221fC0E840F29BB042ad5bFC89B5c:0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0:0x5753544554482d42000000000000000000000000000000000000000000000000', // wstETH-B
  // '1666137600:0xC6424e862f1462281B0a5FAc078e4b63006bDEBF:0xae78736cd615f374d3085123a210448e74fc6393:0x524554482d410000000000000000000000000000000000000000000000000000', // RETH-A
  // '1599177600:0x7e62B7E279DFC78DEB656E34D6a435cC08a44666:0x8e870d67f660d95d5be530380d0ec0bd388289e1:0x5041585553442d41000000000000000000000000000000000000000000000000', // PAXUSD-A
  // '1584403200:0xA191e578a6736167326d05c119CE0c90849E84B7:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:0x555344432d410000000000000000000000000000000000000000000000000000', // USDC-A
  // '1590624000:0x2600004fd1585f7270756DDc88aD9cfA10dD0428:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:0x555344432d420000000000000000000000000000000000000000000000000000', // USDC-B
  // '1588291200:0xBF72Da2Bd84c5170618Fbe5914B0ECA9638d5eb5:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599:0x574254432d410000000000000000000000000000000000000000000000000000', // WBTC-A
  // '1637193600:0xfA8c996e158B80D77FbD0082BB437556A65B96E0:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599:0x574254432d420000000000000000000000000000000000000000000000000000', // WBTC-B
  // '1637798400:0x7f62f9592b823331E012D3c5DdF2A7714CfB9de2:0x2260fac5e5542a773aa44fbcfedf7c193bc2c599:0x574254432d430000000000000000000000000000000000000000000000000000', // WBTC-C
  // '1605225600:0xe29A14bcDeA40d83675aa43B72dF07f649738C8b:0x056fd409e1d7a124bd7017459dfea2f387b6d5cd:0x475553442d410000000000000000000000000000000000000000000000000000', // GUSD-A
  // '1608336000:0x0A59649758aa4d66E25f08Dd01271e891fe52199:0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48:0x50534d2d555344432d4100000000000000000000000000000000000000000000', // PSM USDC-A
  // '1629417600:0x7bbd8cA5e413bCa521C2c80D8d1908616894Cf21:0x8e870d67f660d95d5be530380d0ec0bd388289e1:0x50534d2d5041582d410000000000000000000000000000000000000000000000', // PSM USDP-A
  // '1637884800:0x79A0FA989fb7ADf1F8e80C93ee605Ebb94F7c6A5:0x056fd409e1d7a124bd7017459dfea2f387b6d5cd:0x50534d2d475553442d4100000000000000000000000000000000000000000000', // PSM GUSD-A
  // // RWA
  // '1614816000:0x476b81c12Dc71EDfad1F64B9E07CaA60F4b156E2:0x10b2aa5d77aa6484886d8e244f0686ab319a270d:0x5257413030312d41000000000000000000000000000000000000000000000000', // RWA001-A
  // '1617840000:0xe72C7e90bc26c11d45dBeE736F0acf57fC5B7152:0xaaa760c2027817169d7c8db0dc61a2fb4c19ac23:0x5257413030322d41000000000000000000000000000000000000000000000000', // RWA002-A
  // '1626393600:0x1Fe789BBac5b141bdD795A3Bc5E12Af29dDB4b86:0x07f0a80ad7aeb7bfb7f139ea71b3c8f7e17156b9:0x5257413030332d41000000000000000000000000000000000000000000000000', // RWA003-A
  // '1626393600:0xD50a8e9369140539D1c2D113c4dC1e659c6242eB:0x873f2101047a62f84456e3b2b13df2287925d3f9:0x5257413030342d41000000000000000000000000000000000000000000000000', // RWA004-A
  // '1626393600:0xA4fD373b93aD8e054970A3d6cd4Fd4C31D08192e:0x6db236515e90fc831d146f5829407746eddc5296:0x5257413030352d41000000000000000000000000000000000000000000000000', // RWA005-A
  // '1663977600:0x476aaD14F42469989EFad0b7A31f07b795FF0621:0x078fb926b041a816FaccEd3614Cf1E4bc3C723bD:0x5257413030372d41000000000000000000000000000000000000000000000000', // RWA007-A
  // '1658880000:0xEe0FC514280f09083a32AE906cCbD2FAc4c680FA:0x8b9734bbaA628bFC0c9f323ba08Ed184e5b88Da2:0x5257413030392d41000000000000000000000000000000000000000000000000', // RWA009-A
  // '1670284800:0x75646F68B8c5d8F415891F7204978Efb81ec6410:0x3c7f1379b5ac286eb3636668deae71eaa5f7518c:0x5257413031322d41000000000000000000000000000000000000000000000000', // RWA012-A
  // '1670284800:0x779D0fD012815D4239BAf75140e6B2971BEd5113:0xd6c7fd4392d328e4a8f8bc50f4128b64f4db2d4c:0x5257413031332d41000000000000000000000000000000000000000000000000', // RWA013-A
  // '1684800000:0xAd722E51569EF41861fFf5e11942a8E07c7C309e:0x75dca04c4acc1ffb0aef940e5b49e2c17416008a:0x5257413031342d41000000000000000000000000000000000000000000000000', // RWA014-A
  // '1685750400:0x8938988f7B368f74bEBdd3dcd8D6A3bd18C15C0b:0xf5E5E706EfC841BeD1D24460Cd04028075cDbfdE:0x5257413031352d41000000000000000000000000000000000000000000000000', // RWA015-A
];

// basic GemJoin/AuthGemJoin
export interface MakerGem {
  birthday: number;
  address: string;
  collateralAddress: string;
  ilk: string; // bytes
}

export interface MakerProtocolConfig extends ProtocolConfig {
  chain: string;
  dai: string;
  daiJoin: string;
  vat: string;
  spot: string;
  pot: string;
  jug: string;
  dog: string;
  gems: Array<MakerGem>;
}

export const MakerConfigs: MakerProtocolConfig = {
  protocol: ProtocolNames.maker,
  category: ProtocolCategories.lending,
  birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  dai: '0x6b175474e89094c44da98b954eedeac495271d0f',
  daiJoin: '0x9759a6ac90977b93b58547b4a71c78317f391a28',
  vat: '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b',
  spot: '0x65c79fcb50ca1594b025960e539ed7a9a6d434a3',
  pot: '0x197e90f9fad81970ba7976f33cbd77088e5d7cf7',
  jug: '0x19c0976f590d67707e62397c87829d896dc0f1f1',
  dog: '0x135954d155898d42c90d2a57824c690e0c7bef1b',
  gems: MakerGemJoins.map((item) => {
    const [birthday, address, collateral, ilk] = item.split(':');
    return {
      birthday: Number(birthday),
      address: address,
      collateralAddress: collateral,
      ilk: ilk,
    };
  }),
};
