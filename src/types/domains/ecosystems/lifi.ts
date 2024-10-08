import { ProtocolData } from '../protocol';

export interface LifiDataExtended {
  volumeBridges: {
    // bridge => volume
    [key: string]: number;
  };

  volumeIntegrators: {
    // name => volume
    [key: string]: number;
  };

  // fee recipients
  // https://docs.li.fi/monetization-take-fees
  // address => fee amount usd
  feeRecipients: {
    [key: string]: number;
  };
}

export interface LifiProtocolData extends ProtocolData, LifiDataExtended {}
