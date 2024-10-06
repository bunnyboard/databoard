import { ProtocolData } from '../protocol';

export interface BungeeDataExtended {
  // bridge => bridge volume
  volumeBridges: {
    [key: string]: number;
  };

  // fee recipients
  // https://docs.bungee.exchange/socket-api/guides/gateway-fee-collection
  // address => fee amount usd
  feeRecipients: {
    [key: string]: number;
  };
}

export interface BungeeProtocolData extends ProtocolData, BungeeDataExtended {}
