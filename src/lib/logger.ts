import winston from 'winston';

import EnvConfig from '../configs/envConfig';
import { AxiosError } from 'axios';
import { findLongestStringLength } from './utils';
import util from 'util';

const fgCyan = '\x1b[36m';
const fgGrey = '\x1b[90m';
const reset = '\x1b[0m';

function formatLevel(entryLevel: string): string {
  entryLevel = entryLevel
    .replace('info', 'INFO')
    .replace('warn', 'WARN')
    .replace('error', 'ERROR')
    .replace('erro', 'ERRO')
    .replace('debug', 'DEBUG');

  if (entryLevel.includes('DEBUG') || entryLevel.includes('ERROR')) {
    if (entryLevel.includes('DEBUG')) {
      return fgGrey + 'DEBUG' + reset;
    } else {
      return entryLevel;
    }
  } else {
    return entryLevel + ' ';
  }
}

function formatService(service: string): string {
  return (service + ':').padEnd(25);
}

function formatMessage(message: string): string {
  return message.padEnd(40);
}

const customFormat = winston.format.printf((entry: any) => {
  const service = entry.service ? entry.service : 'unknown';

  let propsLine = '';
  for (const [key, value] of Object.entries(entry)) {
    if (['timestamp', 'service', 'level', 'message', 'configs'].indexOf(key) === -1) {
      propsLine += `${fgCyan + key + reset}=${value} `;
    }
  }

  let logLine = `${formatLevel(entry.level)} ${('[' + entry.timestamp + ']').padStart(10)} ${formatService(service)} ${formatMessage(entry.message)} ${
    propsLine.length > 0 ? propsLine.slice(0, -1) : ''
  }`;

  if (entry.configs) {
    const maxLength = findLongestStringLength(Object.keys(entry.configs));
    for (const [key, value] of Object.entries(entry.configs)) {
      logLine += `\n${formatLevel(entry.level)} ${('[' + entry.timestamp + ']').padStart(10)} ${formatService(service)}  - ${(key + ':').padEnd(maxLength + 1)} ${value}`;
    }
  }

  return logLine;
});

const logger = winston.createLogger({
  level: EnvConfig.env.debug ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat,
  ),
  transports: [new winston.transports.Console({})],
});

export function logBreakLine() {
  console.log(
    '---------------------------------------------------------------------------------------------------------',
  );
}

// extension
export function logAxiosError(error: AxiosError) {
  console.log('axios request error');
  console.log(error.config ? error.config.url : '');
  console.log(error.response ? error.response.status : '', error.response ? error.response.statusText : '');
  console.log(error.response && error.response.data ? error.response.statusText : '');
}

export function logObjectFull(item: any) {
  console.log(util.inspect(item, { showHidden: false, depth: null, colors: true }));
}

export default logger;
