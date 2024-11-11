import { getTimestamp } from '../lib/utils';
import { BasicCommand } from './basic';

export class GetTokenPriceCommand extends BasicCommand {
  public readonly name: string = 'getTokenPrice';
  public readonly describe: string = 'Get price (USD) of a given token (chain:address)';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const chain = argv.chain;
    const address = argv.address;
    const timestamp = argv.timestamp === 0 ? getTimestamp() : argv.timestamp;

    const services = await super.getServices();

    const priceUsd = await services.oracle.getTokenPriceUsdRounded({
      chain: chain,
      address: address,
      timestamp: timestamp,
      enableAutoSearching: argv.auto,
    });

    console.log(chain, address, priceUsd);

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      chain: {
        alias: 'c',
        type: 'string',
        default: '',
        describe: 'The blockchain token was deployed on.',
      },
      address: {
        alias: 'a',
        type: 'string',
        default: '',
        describe: 'The token (ERC20) contract address.',
      },
      timestamp: {
        alias: 't',
        type: 'number',
        default: 0,
        describe: 'Get price at given timestamp, use current time if not given.',
      },
      auto: {
        type: 'boolean',
        default: false,
        describe: 'If the hard-config is not set, auto search token on dexes.',
      },
    });
  }
}
