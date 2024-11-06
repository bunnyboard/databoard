import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import L1StandardBridgeAbi from '../../../configs/abi/metis/L1StandardBridge.json';
import OptimismNativeBridgeAdapter from '../optimism/nativeBridge';

export default class MetisNativeBridgeAdapter extends OptimismNativeBridgeAdapter {
  public readonly name: string = 'adapter.metis';

  protected readonly abiConfigs: any;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.abiConfigs = {
      events: {
        // for ETH
        ETHDepositInitiated: '0x742461272f8da1cbe655542d3257acb1f1d5f4e6eaa79692ac5609b0f89cb644',
        ETHWithdrawalFinalized: '0x727233b1ab656a027266fdc255d394b9aa8a2db3b7ff0fd6150dc3a8686f30cb',

        // for ERC20
        ERC20DepositInitiated: '0x718594027abd4eaed59f95162563e0cc6d0e8d5b86b1c7be8b1b0ac3343d0396',
        ERC20WithdrawalFinalized: '0x3ceee06c1e37648fcbb6ed52e17b3e1f275a1f8c7b22a84b2b84732431e046b3',
      },
      abi: L1StandardBridgeAbi,
    };
  }
}
