import { ProtocolData } from '../../types/domains/protocol';

interface FillupOptions {
  // if true, treat borrow as money outflow, repay as money inflow
  uncountBorrowRepayAsMoneyFlow: boolean;
}

export default class AdapterDataHelper {
  public static fillupAndFormatProtocolData(protocolData: ProtocolData, options?: FillupOptions): ProtocolData {
    // count money in
    if (protocolData.volumes.deposit) {
      protocolData.moneyFlowIn += protocolData.volumes.deposit;
    }

    // count money out
    if (protocolData.volumes.withdraw) {
      protocolData.moneyFlowOut += protocolData.volumes.withdraw;
    }
    if (protocolData.volumes.liquidation) {
      protocolData.moneyFlowOut += protocolData.volumes.liquidation;
    }
    if (protocolData.volumes.redeemtion) {
      protocolData.moneyFlowOut += protocolData.volumes.redeemtion;
    }

    if (!options || !options.uncountBorrowRepayAsMoneyFlow) {
      if (protocolData.volumes.borrow) {
        protocolData.moneyFlowOut += protocolData.volumes.borrow;
      }
      if (protocolData.volumes.repay) {
        protocolData.moneyFlowIn += protocolData.volumes.repay;
      }
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
          protocolData.breakdown[chain][address].moneyFlowIn += token.volumes.deposit;
        }

        if (token.volumes.withdraw) {
          protocolData.breakdown[chain][address].moneyFlowOut += token.volumes.withdraw;
        }
        if (token.volumes.liquidation) {
          protocolData.breakdown[chain][address].moneyFlowOut += token.volumes.liquidation;
        }
        if (token.volumes.redeemtion) {
          protocolData.breakdown[chain][address].moneyFlowOut += token.volumes.redeemtion;
        }

        if (!options || !options.uncountBorrowRepayAsMoneyFlow) {
          if (token.volumes.borrow) {
            protocolData.breakdown[chain][address].moneyFlowOut += token.volumes.borrow;
          }
          if (token.volumes.repay) {
            protocolData.breakdown[chain][address].moneyFlowIn += token.volumes.repay;
          }
        }

        protocolData.breakdown[chain][address].moneyFlowNet =
          protocolData.breakdown[chain][address].moneyFlowIn - protocolData.breakdown[chain][address].moneyFlowOut;

        for (const value of Object.values(token.volumes)) {
          protocolData.breakdown[chain][address].totalVolume += value;
        }
      }
    }

    // process chain breakdown
    if (protocolData.breakdownChains) {
      for (const [chain, chainData] of Object.entries(protocolData.breakdownChains)) {
        if (chainData.volumes.deposit) {
          protocolData.breakdownChains[chain].moneyFlowIn += chainData.volumes.deposit;
        }

        if (chainData.volumes.withdraw) {
          protocolData.breakdownChains[chain].moneyFlowOut += chainData.volumes.withdraw;
        }
        if (chainData.volumes.liquidation) {
          protocolData.breakdownChains[chain].moneyFlowOut += chainData.volumes.liquidation;
        }
        if (chainData.volumes.redeemtion) {
          protocolData.breakdownChains[chain].moneyFlowOut += chainData.volumes.redeemtion;
        }

        if (!options || !options.uncountBorrowRepayAsMoneyFlow) {
          if (chainData.volumes.borrow) {
            protocolData.breakdownChains[chain].moneyFlowOut += chainData.volumes.borrow;
          }
          if (chainData.volumes.repay) {
            protocolData.breakdownChains[chain].moneyFlowIn += chainData.volumes.repay;
          }
        }

        protocolData.breakdownChains[chain].moneyFlowNet =
          protocolData.breakdownChains[chain].moneyFlowIn - protocolData.breakdownChains[chain].moneyFlowOut;

        for (const value of Object.values(chainData.volumes)) {
          protocolData.breakdownChains[chain].totalVolume += value;
        }
      }
    }

    return protocolData;
  }
}
