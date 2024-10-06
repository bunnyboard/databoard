#! /usr/bin/env node

import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { RunCommand } from './cmd/run';
import { TestCommand } from './cmd/test';
import { ClearProtocolDataCommand } from './cmd/clearProtocolData';
import { GetTokenPriceCommand } from './cmd/getTokenPrice';

(async function () {
  dotenv.config();

  const runCommand = new RunCommand();
  const testCommand = new TestCommand();
  const clearProtocolDataCommand = new ClearProtocolDataCommand();
  const getTokenPriceCommand = new GetTokenPriceCommand();

  yargs(process.argv.slice(2))
    .scriptName('bunny')
    .command(runCommand.name, runCommand.describe, runCommand.setOptions, runCommand.execute)
    .command(testCommand.name, testCommand.describe, testCommand.setOptions, testCommand.execute)
    .command(
      clearProtocolDataCommand.name,
      clearProtocolDataCommand.describe,
      clearProtocolDataCommand.setOptions,
      clearProtocolDataCommand.execute,
    )
    .command(
      getTokenPriceCommand.name,
      getTokenPriceCommand.describe,
      getTokenPriceCommand.setOptions,
      getTokenPriceCommand.execute,
    )
    .help().argv;
})();
