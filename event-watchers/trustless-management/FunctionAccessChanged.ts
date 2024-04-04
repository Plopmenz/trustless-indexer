import { checksumAddress } from "viem";

import { Storage } from "../../index.js";
import { ContractWatcher } from "../../utils/contract-watcher.js";
import { FunctionAccessChanged } from "../../types/trustless-management-events.js";
import { TrustlessManagementContract } from "../../contracts/TrustlessManagement.js";
import { createRoleIfNotExists, calculateFunctionId } from "./trustlessManagementHelpers.js";

export function watchFunctionAccessChanged(contractWatcher: ContractWatcher, storage: Storage) {
  contractWatcher.startWatching("FunctionAccessChanged", {
    abi: TrustlessManagementContract.abi,
    // All addresses
    eventName: "FunctionAccessChanged",
    strict: true,
    onLogs: async (logs) => {
      await Promise.all(
        logs.map(async (log) => {
          const { args, blockNumber, transactionHash, address } = log;

          const event = {
            type: "FunctionAccessChanged",
            blockNumber: blockNumber,
            transactionHash: transactionHash,
            chainId: contractWatcher.chain.id,
            address: address,
            ...args,
          } as FunctionAccessChanged;

          await processFunctionAccessChanged(event, storage);
        })
      );
    },
  });
}

export async function processFunctionAccessChanged(event: FunctionAccessChanged, storage: Storage): Promise<void> {
  let managementEvent: number;
  await storage.trustlessManagementEvents.update((managementEvents) => {
    managementEvent = managementEvents.push(event) - 1;
  });

  const trustlessManagement = checksumAddress(event.address);
  const dao = checksumAddress(event.dao);
  const role = event.role.toString();

  const functionId = calculateFunctionId(event.zone, event.functionSelector);
  const permissionChecker = checksumAddress(event.permissionChecker);
  await storage.trustlessManagement.update((tmStorage) => {
    createRoleIfNotExists({ tmStorage: tmStorage, chainId: event.chainId, trustlessManagement: trustlessManagement, dao: dao, role: role });
    const daoInfo = tmStorage[event.chainId][trustlessManagement][dao];
    const permission = daoInfo.permissions[role];
    permission.functionAccess[functionId] = permissionChecker;

    daoInfo.events.push(managementEvent);
  });
}
