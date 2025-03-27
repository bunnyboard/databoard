import { decodeEventLog, decodeFunctionData } from 'viem';
import MarketplaceV2Abi from '../../../configs/abi/blur/BlurExchangeV2.json';
import BlurSwapAbi from '../../../configs/abi/blur/BlurSwap.json';
import BlurBlendAbi from '../../../configs/abi/blur/BlurBlend.json';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';

export interface DecodeTxnInputOptions {
  transactionHash: `0x${string}`;
  input: `0x${string}`;
}

export interface DecodeEventOptions {
  log: any;
}

export interface DecodeTxnInputResult {
  totalVolumeEth: number;
  totalRoyalFeeEth: number;
  collections: {
    [key: string]: {
      voumeEth: number;
      royalFeeEth: number;
    };
  };
}

const Events = {
  Execution: '0xf2f66294df6fae7ac681cbe2f6d91c6904485929679dce263e8f6539b7d5c559',
  Execution721Packed: '0x1d5e12b51dee5e4d34434576c3fb99714a85f57b0fd546ada4b0bddd736d12b2',
  Execution721MakerFeePacked: '0x7dc5c0699ac8dd5250cbe368a2fc3b4a2daadb120ad07f6cccea29f83482686e',
  Execution721TakerFeePacked: '0x0fcf17fac114131b10f37b183c6a60f905911e52802caeeb3e6ea210398b81ab',
};

export default class BlurMarketplaceLibs {
  public static decodeEventPacked(options: DecodeEventOptions): DecodeTxnInputResult {
    const result: DecodeTxnInputResult = {
      totalVolumeEth: 0,
      totalRoyalFeeEth: 0,
      collections: {},
    };

    const event: any = decodeEventLog({
      abi: MarketplaceV2Abi,
      topics: options.log.topics,
      data: options.log.data,
    });

    let listingPriceEth = 0;
    let royalFeeEth = 0;
    let collection: string | null = null;
    if (options.log.topics[0] === Events.Execution) {
      collection = normalizeAddress(event.args.transfer.collection);

      listingPriceEth = formatBigNumberToNumber(event.args.price.toString(), 18);

      const makerFee = formatBigNumberToNumber(event.args.fees.takerFee.rate, 4);
      const takerFee = formatBigNumberToNumber(event.args.makerFee.rate, 4);
      const protocolFee = formatBigNumberToNumber(event.args.fees.protocolFee.rate, 4);
      const feeRate = makerFee + takerFee + protocolFee;

      royalFeeEth = listingPriceEth * feeRate;
    } else {
      const collectionPriceSidePacked = BigInt(event.args.collectionPriceSide.toString());

      // Extract orderType (shifted left by 31 * 8 = 248 bits)
      const orderType = Number(collectionPriceSidePacked >> BigInt(31 * 8));

      if (orderType !== 0) {
        return result;
      }

      // Extract price (shifted left by 20 * 8 = 160 bits)
      // Mask: 96 bits
      const priceMask = (BigInt(1) << BigInt(96)) - BigInt(1);
      const price = (collectionPriceSidePacked >> BigInt(20 * 8)) & priceMask;
      listingPriceEth = formatBigNumberToNumber(price.toString(), 18);

      // Extract collection (lowest 160 bits)
      // Mask: 160 bits
      const addressMask = (BigInt(1) << BigInt(160)) - BigInt(1);
      const collectionBigInt = collectionPriceSidePacked & addressMask;
      // Convert to address format (hex string with 0x prefix)
      const collectionHex = collectionBigInt.toString(16).padStart(40, '0');
      collection = normalizeAddress('0x' + collectionHex.slice(-40));

      if (
        options.log.topics[0] === Events.Execution721MakerFeePacked ||
        options.log.topics[0] === Events.Execution721TakerFeePacked
      ) {
        const feePacked = BigInt(
          event.args.makerFeeRecipientRate
            ? event.args.makerFeeRecipientRate.toString()
            : event.args.takerFeeRecipientRate.toString(),
        );

        // Extract rate (shifted left by 20 * 8 = 160 bits)
        // Mask: 96 bits
        const rateMask = (BigInt(1) << BigInt(96)) - BigInt(1);
        const rate = (feePacked >> BigInt(20 * 8)) & rateMask;

        const feeRate = formatBigNumberToNumber(rate.toString(), 4);
        royalFeeEth = listingPriceEth * feeRate;
      }
    }

    if (collection) {
      result.totalVolumeEth += listingPriceEth;
      result.totalRoyalFeeEth += royalFeeEth;
      if (!result.collections[collection]) {
        result.collections[collection] = {
          voumeEth: 0,
          royalFeeEth: 0,
        };
      }
      result.collections[collection].voumeEth += listingPriceEth;
      result.collections[collection].royalFeeEth += royalFeeEth;
    }

    return result;
  }

  public static decodeExchangeV2Input(options: DecodeTxnInputOptions): DecodeTxnInputResult {
    const result: DecodeTxnInputResult = {
      totalVolumeEth: 0,
      totalRoyalFeeEth: 0,
      collections: {},
    };

    const params: any = decodeFunctionData({
      abi: MarketplaceV2Abi,
      data: options.input,
    });

    switch (params.functionName) {
      case 'takeBidSingle':
      case 'takeAskSingle':
      case 'takeAskSinglePool': {
        const exchangeItem = params.args[0].exchange;
        const orderItem = params.args[0].order;

        // count listing price as trade volume
        const listingPriceEth = formatBigNumberToNumber(exchangeItem.listing.price.toString(), 18);

        let royalFeeEth = 0;
        if (params.functionName === 'takeBidSingle') {
          // on takeBid, royal feeRate from taker
          const takerFeeRate = formatBigNumberToNumber(params.args[0].takerFee.rate.toString(), 4);
          royalFeeEth = listingPriceEth * takerFeeRate;
        } else {
          // on takeAskSingle and takeAskSinglePool, feeRate from makers
          const makerFeeRate = formatBigNumberToNumber(orderItem.makerFee.rate.toString(), 4);
          royalFeeEth = listingPriceEth * makerFeeRate;
        }

        const collection = normalizeAddress(orderItem.collection);
        if (!result.collections[collection]) {
          result.collections[collection] = {
            voumeEth: 0,
            royalFeeEth: 0,
          };
        }

        result.totalVolumeEth += listingPriceEth;
        result.totalRoyalFeeEth += royalFeeEth;
        result.collections[collection].voumeEth += listingPriceEth;
        result.collections[collection].royalFeeEth += royalFeeEth;

        break;
      }

      case 'takeAskPool':
      case 'takeAsk':
      case 'takeBid': {
        for (let i = 0; i < params.args[0].exchanges.length; i++) {
          const exchangeItem = params.args[0].exchanges[i];
          const orderItem = params.args[0].orders[Number(exchangeItem.index)];

          // count listing price as trade volume
          const listingPriceEth = formatBigNumberToNumber(exchangeItem.listing.price.toString(), 18);

          let royalFeeEth = 0;
          if (params.functionName === 'takeBid') {
            // on takeBid, royal feeRate from taker
            const takerFeeRate = formatBigNumberToNumber(params.args[0].takerFee.rate.toString(), 4);
            royalFeeEth = listingPriceEth * takerFeeRate;
          } else {
            // on takeAsk and takeAskPool, feeRate from makers
            const makerFeeRate = formatBigNumberToNumber(orderItem.makerFee.rate.toString(), 4);
            royalFeeEth = listingPriceEth * makerFeeRate;
          }

          const collection = normalizeAddress(orderItem.collection);
          if (!result.collections[collection]) {
            result.collections[collection] = {
              voumeEth: 0,
              royalFeeEth: 0,
            };
          }

          result.totalVolumeEth += listingPriceEth;
          result.totalRoyalFeeEth += royalFeeEth;
          result.collections[collection].voumeEth += listingPriceEth;
          result.collections[collection].royalFeeEth += royalFeeEth;
        }

        break;
      }
    }

    return result;
  }

  public static decodeTxnInput(options: DecodeTxnInputOptions): DecodeTxnInputResult {
    const result: DecodeTxnInputResult = {
      totalVolumeEth: 0,
      totalRoyalFeeEth: 0,
      collections: {},
    };

    const params: any = decodeFunctionData({
      abi: MarketplaceV2Abi.concat(BlurSwapAbi).concat(BlurBlendAbi),
      data: options.input,
    });

    switch (params.functionName) {
      case 'takeBidSingle':
      case 'takeAskSingle':
      case 'takeAskSinglePool':
      case 'takeAskPool':
      case 'takeAsk':
      case 'takeBid': {
        return BlurMarketplaceLibs.decodeExchangeV2Input(options);
      }

      // BlurSwap contract
      case 'batchBuyWithETH':
      case 'batchBuyWithERC20s': {
        const calls = params.functionName === 'batchBuyWithETH' ? params.args[0] : params.args[1];
        for (const item of calls) {
          const marketId = Number(item.marketId);
          if (marketId === 11) {
            // BlurExchangeV2 contract
            // check by use market registry contract
            // https://etherscan.io/address/0x39da41747a83aee658334415666f3ef92dd0d541#readContract#F6
            const exchangeV2Result = BlurMarketplaceLibs.decodeExchangeV2Input({
              transactionHash: options.transactionHash,
              input: item.tradeData,
            });

            for (const [collection, metrics] of Object.entries(exchangeV2Result.collections)) {
              if (!result.collections[collection]) {
                result.collections[collection] = {
                  voumeEth: 0,
                  royalFeeEth: 0,
                };
              }

              result.totalVolumeEth += metrics.voumeEth;
              result.totalRoyalFeeEth += metrics.royalFeeEth;
              result.collections[collection].voumeEth += metrics.voumeEth;
              result.collections[collection].royalFeeEth += metrics.royalFeeEth;
            }
          } else {
            // we can not detect the collection
            result.totalVolumeEth += formatBigNumberToNumber(item.value.toString(), 18);
          }
        }
        break;
      }

      // BlurBlend
      case 'takeBidV2':
      case 'buyToBorrowV2':
      case 'buyToBorrowV2ETH': {
        const order = params.functionName === 'takeBidV2' ? params.args[2].order : params.args[3].order;
        const listing = params.functionName === 'takeBidV2' ? params.args[2].listing : params.args[3].listing;

        const collection = normalizeAddress(order.collection);
        const makerFeeRate = formatBigNumberToNumber(order.makerFee.rate.toString(), 4);
        const listingPriceEth = formatBigNumberToNumber(listing.price.toString(), 18);
        if (!result.collections[collection]) {
          result.collections[collection] = {
            voumeEth: 0,
            royalFeeEth: 0,
          };
        }

        result.totalVolumeEth += listingPriceEth;
        result.totalRoyalFeeEth += listingPriceEth * makerFeeRate;
        result.collections[collection].voumeEth += listingPriceEth;
        result.collections[collection].royalFeeEth += listingPriceEth * makerFeeRate;

        break;
      }
    }

    return result;
  }
}
