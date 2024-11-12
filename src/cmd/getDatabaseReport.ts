import { formatMoney, formatTime } from '../lib/utils';
import DatabaseStatusReport from '../modules/utils/databaseStatus';
import { ContextServices, ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';

export class GetDatabaseReportCommand extends BasicCommand {
  public readonly name: string = 'getDatabaseReport';
  public readonly describe: string = 'Get data and sync status from database.';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();
    const storages: ContextStorages = await super.getStorages();

    const databaseStatus = new DatabaseStatusReport(services, storages);

    const result = await databaseStatus.getDatabaseStatus();

    console.table(
      result.protocols
        .sort(function (a: any, b: any) {
          return a.timestamp > b.timestamp ? -1 : 1;
        })
        .map((item: any) => {
          return {
            protocol: item.protocol,
            totalValueLocked: `$${formatMoney(item.totalValueLocked.toString())}`,
            lastStateUpdateTime: formatTime(item.timestamp),
            lastSnapshotUpdateTime: item.lastSnapshot
              ? new Date(item.lastSnapshot * 1000).toISOString().split('T')[0]
              : null,
          };
        }),
    );

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({});
  }
}
