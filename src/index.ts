#! /usr/bin/env node

import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { RunCommand } from './cmd/run';
import { ChainCommand } from './cmd/chain';
import { TestCommand } from './cmd/test';

(async function () {
  dotenv.config();

  const runCommand = new RunCommand();
  const chainCommand = new ChainCommand();
  const testCommand = new TestCommand();

  yargs(process.argv.slice(2))
    .scriptName('bunny')
    .command(runCommand.name, runCommand.describe, runCommand.setOptions, runCommand.execute)
    .command(chainCommand.name, chainCommand.describe, chainCommand.setOptions, chainCommand.execute)
    .command(testCommand.name, testCommand.describe, testCommand.setOptions, testCommand.execute)
    .help().argv;
})();
