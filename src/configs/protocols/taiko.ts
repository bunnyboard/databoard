import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface TaikoBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  taikoBridge: string;
  taikoErc20Vault: string;
  supportedTokens: Array<string>;
}

export const TaikoNativeBridgeConfigs: TaikoBridgeProtocolConfig = {
  protocol: ProtocolNames.taikoNativeBridge,
  birthday: 1714608000, // Thu May 02 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.taiko,
  taikoBridge: '0xd60247c6848B7Ca29eDdF63AA924E53dB6Ddd8EC',
  taikoErc20Vault: '0x996282cA11E5DEb6B5D122CC3B9A1FcAAD4415Ab',
  supportedTokens: [
    '0x10dea67478c5f8c5e2d90e5e9b26dbe60c54d800',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    '0x9ad37205d608b8b219e6a2573f922094cec5c200',
    '0xae78736cd615f374d3085123a210448e74fc6393',
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0xa487bf43cf3b10dffc97a9a744cbb7036965d3b9',
    '0xd38bb40815d2b0c2d2c866e0c72c5728ffc76dd9',
    '0xd33526068d116ce69f19a9ee46f0bd304f21a51f',
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0x4d224452801aced8b2f0aebe155379bb5d594381',
  ],
};
