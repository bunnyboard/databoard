#! /usr/bin/env node

import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { TestCommand } from './cmd/test';
import { RunCommand } from './cmd/run';
import { ClearProtocolDataCommand } from './cmd/clearProtocolData';
import { GetTokenPriceCommand } from './cmd/getTokenPrice';
import { GetDatabaseReportCommand } from './cmd/getDatabaseReport';

(async function () {
  dotenv.config();

  const testCommand = new TestCommand();
  const runCommand = new RunCommand();
  const clearProtocolDataCommand = new ClearProtocolDataCommand();
  const getTokenPriceCommand = new GetTokenPriceCommand();
  const getDatabaseReportCommand = new GetDatabaseReportCommand();

  yargs(process.argv.slice(2))
    .scriptName('bunny')
    .command(testCommand.name, testCommand.describe, testCommand.setOptions, testCommand.execute)
    .command(runCommand.name, runCommand.describe, runCommand.setOptions, runCommand.execute)
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
    .command(
      getDatabaseReportCommand.name,
      getDatabaseReportCommand.describe,
      getDatabaseReportCommand.setOptions,
      getDatabaseReportCommand.execute,
    )
    .help().argv;
})();
