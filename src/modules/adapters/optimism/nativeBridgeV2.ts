import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import L1StandardBridgeAbi from '../../../configs/abi/optimism/L1StandardBridge.json';
import OptimismNativeBridgeAdapter from './nativeBridge';

export default class OptimismNativeBridgeAdapterV2 extends OptimismNativeBridgeAdapter {
  public readonly name: string = 'adapter.optimism';

  protected readonly abiConfigs: any;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abiConfigs = {
      events: {
        // for ETH
        ETHDepositInitiated: '0x7ff126db8024424bbfd9826e8ab82ff59136289ea440b04b39a0df1b03b9cabf',
        ETHWithdrawalFinalized: '0xd59c65b35445225835c83f50b6ede06a7be047d22e357073e250d9af537518cd',

        // for ERC20
        ERC20DepositInitiated: '0x2849b43074093a05396b6f2a937dee8565b15a48a7b3d4bffb732a5017380af5',
        ERC20WithdrawalFinalized: '0x31b2166ff604fc5672ea5df08a78081d2bc6d746cadce880747f3643d819e83d',
      },
      abi: L1StandardBridgeAbi,
    };
  }
}
