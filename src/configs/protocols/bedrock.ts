import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface BedrockEthStakingConfig {
  chain: string;
  uniETH: string;
  staking: string;
}

export interface BedrockBtcStakingConfig {
  chain: string;
  birthday: number;
  uniBTC: string;
  vault: string;
  tokens: Array<string>;
}

export interface BedrockProtocolConfig extends ProtocolConfig {
  ethStaking: BedrockEthStakingConfig;
  btcStaking: Array<BedrockBtcStakingConfig>;
}

export const BedrockConfigs: BedrockProtocolConfig = {
  protocol: ProtocolNames.bedrock,
  birthday: 1664582400, // Sat Oct 01 2022 00:00:00 GMT+0000
  ethStaking: {
    chain: ChainNames.ethereum,
    uniETH: '0xF1376bceF0f78459C0Ed0ba5ddce976F1ddF51F4',
    staking: '0x4beFa2aA9c305238AA3E0b5D17eB20C045269E9d',
  },
  btcStaking: [
    {
      chain: ChainNames.ethereum,
      birthday: 1713052800, // Sun Apr 14 2024 00:00:00 GMT+0000
      uniBTC: '0x004E9C3EF86bc1ca1f0bB5C7662861Ee93350568',
      vault: '0x047D41F2544B7F63A8e991aF2068a363d210d6Da',
      tokens: [
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        '0xc96de26018a54d51c097160568752c4e3bd6c364',
        '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
        '0x9be89d2a4cd102d8fecc6bf9da793be995c22541',
      ],
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1725321600, // Tue Sep 03 2024 00:00:00 GMT+0000
      uniBTC: '0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a',
      vault: '0x84E5C854A7fF9F49c888d69DECa578D406C26800',
      tokens: ['0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c'],
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1726012800, // Wed Sep 11 2024 00:00:00 GMT+0000
      uniBTC: '0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a',
      vault: '0x84E5C854A7fF9F49c888d69DECa578D406C26800',
      tokens: ['0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f', '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf'],
    },
    {
      chain: ChainNames.optimism,
      birthday: 1720483200, // Tue Jul 09 2024 00:00:00 GMT+0000
      uniBTC: '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e',
      vault: '0xF9775085d726E782E83585033B58606f7731AB18',
      tokens: ['0x68f180fcce6836688e9084f035309e29bf0a2095'],
    },
    {
      chain: ChainNames.bob,
      birthday: 1725148800, // Sun Sep 01 2024 00:00:00 GMT+0000
      uniBTC: '0x236f8c0a61dA474dB21B693fB2ea7AAB0c803894',
      vault: '0x2ac98DB41Cbd3172CB7B8FD8A8Ab3b91cFe45dCf',
      tokens: [
        '0xEE03e367bcB59A9b4c1c0ea495A2e9cAC36372C8',
        '0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3',
        '0xC96dE26018A54D51c097160568752c4E3BD6C364',
      ],
    },
    {
      chain: ChainNames.mantle,
      birthday: 1720828800, // Sat Jul 13 2024 00:00:00 GMT+0000
      uniBTC: '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e',
      vault: '0xF9775085d726E782E83585033B58606f7731AB18',
      tokens: ['0xd681C5574b7F4E387B608ed9AF5F5Fc88662b37c', '0xc96de26018a54d51c097160568752c4e3bd6c364'],
    },
    {
      chain: ChainNames.mode,
      birthday: 1726012800, // Wed Sep 11 2024 00:00:00 GMT+0000
      uniBTC: '0x6B2a01A5f79dEb4c2f3c0eDa7b01DF456FbD726a',
      vault: '0x84E5C854A7fF9F49c888d69DECa578D406C26800',
      tokens: ['0x59889b7021243dB5B1e065385F918316cD90D46c', '0xcDd475325D6F564d27247D1DddBb0DAc6fA0a5CF'],
    },
    // {
    //   chain: ChainNames.merlin,
    //   birthday: 1720742400, // Fri Jul 12 2024 00:00:00 GMT+0000
    //   uniBTC: '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e',
    //   vault: '0xF9775085d726E782E83585033B58606f7731AB18',
    //   tokens: ['0xB880fd278198bd590252621d4CD071b1842E9Bcd'],
    // },
    {
      chain: ChainNames.bitlayer,
      birthday: 1720742400, // Fri Jul 12 2024 00:00:00 GMT+0000
      uniBTC: '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e',
      vault: '0xF9775085d726E782E83585033B58606f7731AB18',
      tokens: ['0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f'],
    },
    {
      chain: ChainNames.bsquared,
      birthday: 1720742400, // Fri Jul 12 2024 00:00:00 GMT+0000
      uniBTC: '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e',
      vault: '0xF9775085d726E782E83585033B58606f7731AB18',
      tokens: ['0x3e904af0Cf56b304d0D286C8fB6eA5A84E33EAb5', '0x4200000000000000000000000000000000000006'],
    },
  ],
};
