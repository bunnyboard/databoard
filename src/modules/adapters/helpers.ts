import { ProtocolData } from '../../types/domains/protocol';

export default class AdapterDataHelper {
  public static fillupAndFormatProtocolData(protocolData: ProtocolData): ProtocolData {
    // count money in
    if (protocolData.volumes.deposit) {
      protocolData.moneyFlowIn += protocolData.volumes.deposit;
    }
    if (protocolData.volumes.repay) {
      protocolData.moneyFlowIn += protocolData.volumes.repay;
    }

    // count money out
    if (protocolData.volumes.withdraw) {
      protocolData.moneyFlowOut += protocolData.volumes.withdraw;
    }
    if (protocolData.volumes.borrow) {
      protocolData.moneyFlowOut += protocolData.volumes.borrow;
    }
    if (protocolData.volumes.liquidation) {
      protocolData.moneyFlowOut += protocolData.volumes.liquidation;
    }
    if (protocolData.volumes.redeemtion) {
      protocolData.moneyFlowOut += protocolData.volumes.redeemtion;
    }

    // count net deposit
    protocolData.moneyFlowNet = protocolData.moneyFlowIn - protocolData.moneyFlowOut;

    // count total volumes
    for (const value of Object.values(protocolData.volumes)) {
      protocolData.totalVolume += value;
    }

    // process tokens breakdown
    for (const [chain, tokens] of Object.entries(protocolData.breakdown)) {
      for (const [address, token] of Object.entries(tokens)) {
        if (token.volumes.deposit) {
          (protocolData.breakdown[chain][address].volumes.deposit as number) += token.volumes.deposit;
        }
        if (token.volumes.repay) {
          (protocolData.breakdown[chain][address].volumes.repay as number) += token.volumes.repay;
        }

        if (token.volumes.borrow) {
          (protocolData.breakdown[chain][address].volumes.borrow as number) += token.volumes.borrow;
        }
        if (token.volumes.withdraw) {
          (protocolData.breakdown[chain][address].volumes.withdraw as number) += token.volumes.withdraw;
        }
        if (token.volumes.liquidation) {
          (protocolData.breakdown[chain][address].volumes.liquidation as number) += token.volumes.liquidation;
        }
        if (token.volumes.redeemtion) {
          (protocolData.breakdown[chain][address].volumes.redeemtion as number) += token.volumes.redeemtion;
        }

        protocolData.breakdown[chain][address].moneyFlowNet = token.moneyFlowIn - token.moneyFlowOut;

        for (const value of Object.values(token.volumes)) {
          protocolData.breakdown[chain][address].totalVolume += value;
        }
      }
    }

    return protocolData;
  }
}
