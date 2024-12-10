export default class GmxUtils {
  // https://github.com/gmx-io/gmx-synthetics/blob/main/contracts/deposit/DepositEventUtils.sol#L23
  public static decodeParamsEvent1_DepositCreated(eventData: any): any {
    const item_initialLongToken = eventData.addressItems.items.filter(
      (item: any) => item.key === 'initialLongToken',
    )[0];
    const item_initialShortToken = eventData.addressItems.items.filter(
      (item: any) => item.key === 'initialShortToken',
    )[0];
    const item_initialLongTokenAmount = eventData.uintItems.items.filter(
      (item: any) => item.key === 'initialLongTokenAmount',
    )[0];
    const item_initialShortTokenAmount = eventData.uintItems.items.filter(
      (item: any) => item.key === 'initialShortTokenAmount',
    )[0];

    return {
      longToken: item_initialLongToken.value,
      shortToken: item_initialShortToken.value,
      longTokenAmount: item_initialLongTokenAmount.value.toString(),
      shortTokenAmount: item_initialShortTokenAmount.value.toString(),
    };
  }

  // https://github.com/gmx-io/gmx-synthetics/blob/main/contracts/withdrawal/WithdrawalEventUtils.sol#L23
  public static decodeParamsEvent1_WithdrawalCreated(eventData: any): any {
    const item_market = eventData.addressItems.items.filter((item: any) => item.key === 'market')[0];
    const item_minLongTokenAmount = eventData.uintItems.items.filter(
      (item: any) => item.key === 'minLongTokenAmount',
    )[0];
    const item_minShortTokenAmount = eventData.uintItems.items.filter(
      (item: any) => item.key === 'minShortTokenAmount',
    )[0];

    return {
      market: item_market.value,
      minLongTokenAmount: item_minLongTokenAmount.value.toString(),
      minShortTokenAmount: item_minShortTokenAmount.value.toString(),
    };
  }

  // https://github.com/gmx-io/gmx-synthetics/blob/main/contracts/pricing/SwapPricingUtils.sol#L304
  public static decodeParamsEvent1_SwapInfo(eventData: any): any {
    const item_tokenIn = eventData.addressItems.items.filter((item: any) => item.key === 'tokenIn')[0];
    const item_tokenOut = eventData.addressItems.items.filter((item: any) => item.key === 'tokenOut')[0];
    const item_amountIn = eventData.uintItems.items.filter((item: any) => item.key === 'amountIn')[0];
    const item_amountInAfterFees = eventData.uintItems.items.filter((item: any) => item.key === 'amountInAfterFees')[0];
    const item_amountOut = eventData.uintItems.items.filter((item: any) => item.key === 'amountOut')[0];

    return {
      tokenIn: item_tokenIn.value,
      tokenOut: item_tokenOut.value,
      amountIn: item_amountIn.value.toString(),
      amountInAfterFees: item_amountInAfterFees.value.toString(),
      amountOut: item_amountOut.value.toString(),
    };
  }

  // https://github.com/gmx-io/gmx-synthetics/blob/main/contracts/pricing/SwapPricingUtils.sol#L339
  public static decodeParamsEvent1_SwapFeesCollected(eventData: any): any {
    const item_token = eventData.addressItems.items.filter((item: any) => item.key === 'token')[0];
    const item_feeReceiverAmount = eventData.uintItems.items.filter((item: any) => item.key === 'feeReceiverAmount')[0];
    const item_feeAmountForPool = eventData.uintItems.items.filter((item: any) => item.key === 'feeAmountForPool')[0];
    const item_uiFeeAmount = eventData.uintItems.items.filter((item: any) => item.key === 'uiFeeAmount')[0];

    return {
      token: item_token.value,
      feeReceiverAmount: item_feeReceiverAmount.value.toString(),
      feeAmountForPool: item_feeAmountForPool.value.toString(),
      uiFeeAmount: item_uiFeeAmount.value.toString(),
    };
  }

  // https://github.com/gmx-io/gmx-synthetics/blob/main/contracts/position/PositionEventUtils.sol#L244
  public static decodeParamsEvent1_PositionFeesCollected(eventData: any): any {
    const item_collateralToken = eventData.addressItems.items.filter((item: any) => item.key === 'collateralToken')[0];
    const item_borrowingFeeUsd = eventData.uintItems.items.filter((item: any) => item.key === 'borrowingFeeUsd')[0];

    return {
      collateralToken: item_collateralToken.value,
      borrowingFeeUsd: item_borrowingFeeUsd.value.toString(),
    };
  }

  // https://github.com/gmx-io/gmx-synthetics/blob/main/contracts/position/PositionEventUtils.sol#L40
  // https://github.com/gmx-io/gmx-synthetics/blob/main/contracts/position/PositionEventUtils.sol#L85
  public static decodeParamsEvent1_PositionChange(eventData: any): any {
    const item_market = eventData.addressItems.items.filter((item: any) => item.key === 'market')[0];
    const item_collateralToken = eventData.addressItems.items.filter((item: any) => item.key === 'collateralToken')[0];
    const item_sizeDeltaUsd = eventData.uintItems.items.filter((item: any) => item.key === 'sizeDeltaUsd')[0];
    const item_collateralDeltaAmount = eventData.uintItems.items.filter(
      (item: any) => item.key === 'collateralDeltaAmount',
    )[0];
    const item_isLong = eventData.boolItems.items.filter((item: any) => item.key === 'isLong')[0];

    return {
      market: item_market.value,
      collateralToken: item_collateralToken.value,
      sizeDeltaUsd: item_sizeDeltaUsd.value.toString(),
      collateralDeltaAmount: item_collateralDeltaAmount ? item_collateralDeltaAmount.value.toString() : '0',
      isLong: Boolean(item_isLong),
    };
  }

  // https://github.com/gmx-io/gmx-synthetics/blob/main/contracts/order/OrderEventUtils.sol#L21
  public static decodeParamsEvent1_OrderCreated(eventData: any): any {
    const item_market = eventData.addressItems.items.filter((item: any) => item.key === 'market')[0];
    const item_initialCollateralToken = eventData.addressItems.items.filter(
      (item: any) => item.key === 'initialCollateralToken',
    )[0];
    const item_orderType = eventData.uintItems.items.filter((item: any) => item.key === 'orderType')[0];
    const item_sizeDeltaUsd = eventData.uintItems.items.filter((item: any) => item.key === 'sizeDeltaUsd')[0];
    const item_initialCollateralDeltaAmount = eventData.uintItems.items.filter(
      (item: any) => item.key === 'initialCollateralDeltaAmount',
    )[0];
    const item_isLong = eventData.boolItems.items.filter((item: any) => item.key === 'isLong')[0];

    return {
      market: item_market.value,
      sizeDeltaUsd: item_sizeDeltaUsd.value,
      initialCollateralToken: item_initialCollateralToken.value,
      orderType: Number(item_orderType.value),
      initialCollateralDeltaAmount: item_initialCollateralDeltaAmount.value.toString(),
      isLong: Boolean(item_isLong),
    };
  }
}
