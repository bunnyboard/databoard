import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import util from 'util';

export async function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

// standard timestamp UTC
export function getTimestamp(): number {
  return Math.floor(new Date().getTime() / 1000);
}

export function getTodayUTCTimestamp() {
  const today = new Date().toISOString().split('T')[0];
  return Math.floor(new Date(today).getTime() / 1000);
}

// get start day timestamp of a timestamp
export function getStartDayTimestamp(timestamp: number) {
  const theDay = new Date(timestamp * 1000).toISOString().split('T')[0];
  return Math.floor(new Date(theDay).getTime() / 1000);
}

export function getDateString(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().split('T')[0];
}

export function normalizeAddress(address: string | undefined | null): string {
  return address ? address.toLowerCase() : '';
}

export function compareAddress(address1: string, address2: string): boolean {
  return normalizeAddress(address1) === normalizeAddress(address2);
}

export function formatBigNumberToString(value: string, decimals: number): string {
  return new BigNumber(value).dividedBy(new BigNumber(10).pow(decimals)).toString(10);
}

export function formatBigNumberToNumber(value: string, decimals: number): number {
  return new BigNumber(value).dividedBy(new BigNumber(10).pow(decimals)).toNumber();
}

export function hexStringToDecimal(hexString: string): number {
  return new BigNumber(hexString, 16).toNumber();
}

// https://etherscan.io/address/0x00000000219ab540356cbb839cbe05303d7705fa#code#L169
export function formatLittleEndian64ToString(bytes8: string): string {
  // remove 0x
  const bytes8Value = bytes8.split('0x')[1];
  let swapBytes8 = '0x';
  swapBytes8 += bytes8Value[14] + bytes8Value[15];
  swapBytes8 += bytes8Value[12] + bytes8Value[13];
  swapBytes8 += bytes8Value[10] + bytes8Value[11];
  swapBytes8 += bytes8Value[8] + bytes8Value[9];
  swapBytes8 += bytes8Value[6] + bytes8Value[7];
  swapBytes8 += bytes8Value[4] + bytes8Value[5];
  swapBytes8 += bytes8Value[2] + bytes8Value[3];
  swapBytes8 += bytes8Value[0] + bytes8Value[1];

  return new BigNumber(hexStringToDecimal(swapBytes8).toString()).dividedBy(1e9).toString(10);
}

export const formatTime = (unix: number): string => {
  const now = dayjs();
  const timestamp = dayjs.unix(unix);

  const inSeconds = now.diff(timestamp, 'second');
  const inMinutes = now.diff(timestamp, 'minute');
  const inHours = now.diff(timestamp, 'hour');
  const inDays = now.diff(timestamp, 'day');

  if (inHours >= 24) {
    return `${inDays} ${inDays === 1 ? 'day' : 'days'} ago`;
  } else if (inMinutes >= 60) {
    return `${inHours} ${inHours === 1 ? 'hour' : 'hours'} ago`;
  } else if (inSeconds >= 60) {
    return `${inMinutes} ${inMinutes === 1 ? 'min' : 'mins'} ago`;
  } else {
    return `${inSeconds} ${inSeconds === 1 ? 'sec' : 'secs'} ago`;
  }
};

export function formatMoney(amount: string) {
  const number = new BigNumber(amount).abs().toNumber();

  if (number === 0) return '0';

  let n;
  if (number >= 1e-4) {
    n = number.toPrecision(4);
  } else if (number > 0 && number < 1e-4) {
    return '<0.0001';
  }

  if (number > 1000000000000) {
    return '>1000b';
  }

  const returnValue =
    Math.abs(Number(n)) >= 1.0e9
      ? Math.abs(Number(n)) / 1.0e9 + 'b'
      : Math.abs(Number(n)) >= 1.0e6
        ? Math.abs(Number(n)) / 1.0e6 + 'm'
        : Math.abs(Number(n)) >= 1.0e3
          ? Math.abs(Number(n)) / 1.0e3 + 'k'
          : Math.abs(Number(n));

  return returnValue.toLocaleString();
}

export function findLongestStringLength(items: Array<string>): number {
  let maximum = 0;
  for (const item of items) {
    if (item.length > maximum) {
      maximum = item.length;
    }
  }
  return maximum;
}

// remove character \u0000 from given string
export function removeNullBytes(str: string): string {
  return str
    .split('')
    .filter((char) => char.codePointAt(0))
    .join('');
}

export function consoleLogFull(item: any) {
  console.log(util.inspect(item, { showHidden: false, depth: null, colors: true }));
}
