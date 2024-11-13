import { describe, expect, test } from 'vitest';
import LeveldbService from './level';
import fs from 'fs';

const testDir = '.localdb.test';

describe('localdb should works ok', function () {
  test('can open local data dir', function () {
    new LeveldbService(testDir);
    const createdDir = fs.existsSync(testDir);

    expect(createdDir).equal(true);

    fs.rmdirSync(testDir, { recursive: true });
  });

  test('write data is ok', async function () {
    const localdb = new LeveldbService(testDir);
    await localdb.writeSingle({
      database: 'testing',
      key: 'name',
      value: 'bunny',
    });

    fs.rmdirSync(testDir, { recursive: true });
  });

  test('write data - batching is ok', async function () {
    const localdb = new LeveldbService(testDir);
    await localdb.writeBatch({
      database: 'testing',
      values: [
        {
          key: 'name1',
          value: 'bunny1',
        },
        {
          key: 'name2',
          value: 'bunny2',
        },
      ],
    });

    fs.rmdirSync(testDir, { recursive: true });
  });

  test('read data is ok', async function () {
    const localdb = new LeveldbService(testDir);
    await localdb.writeSingle({
      database: 'testing',
      key: 'name',
      value: 'bunny',
    });
    const name = await localdb.read({
      database: 'testing',
      key: 'name',
    });

    expect(name).equal('bunny');

    fs.rmdirSync(testDir, { recursive: true });
  });
});
