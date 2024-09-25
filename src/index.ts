#! /usr/bin/env node

import dotenv from 'dotenv';
import yargs from 'yargs/yargs';

import { RunCommand } from './cmd/run';
import { TestCommand } from './cmd/test';
import { ToolCommand } from './cmd/tool';

(async function () {
  dotenv.config();

  const runCommand = new RunCommand();
  const testCommand = new TestCommand();
  const toolCommand = new ToolCommand();

  yargs(process.argv.slice(2))
    .scriptName('bunny')
    .command(runCommand.name, runCommand.describe, runCommand.setOptions, runCommand.execute)
    .command(testCommand.name, testCommand.describe, testCommand.setOptions, testCommand.execute)
    .command(toolCommand.name, toolCommand.describe, toolCommand.setOptions, toolCommand.execute)
    .help().argv;
})();
