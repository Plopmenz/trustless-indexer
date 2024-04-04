import { checksumAddress } from "viem";

import { Storage } from "../../index.js";
import { ContractWatcher } from "../../utils/contract-watcher.js";
import { FullAccessChanged } from "../../types/trustless-management-events.js";
import { TrustlessManagementContract } from "../../contracts/TrustlessManagement.js";
import { createRoleIfNotExists, calculateFunctionId } from "./trustlessManagementHelpers.js";

export function watchFullAccessChanged(contractWatcher: ContractWatcher, storage: Storage) {
  contractWatcher.startWatching("FullAccessChanged", {
    abi: TrustlessManagementContract.abi,
    // All addresses
    eventName: "FullAccessChanged",
    strict: true,
    onLogs: async (logs) => {
      await Promise.all(
        logs.map(async (log) => {
          const { args, blockNumber, transactionHash, address } = log;

          const event = {
            type: "FullAccessChanged",
            blockNumber: blockNumber,
            transactionHash: transactionHash,
            chainId: contractWatcher.chain.id,
            address: address,
            ...args,
          } as FullAccessChanged;

          await processFullAccessChanged(event, storage);
        })
      );
    },
  });
}

export async function processFullAccessChanged(event: FullAccessChanged, storage: Storage): Promise<void> {
  let managementEvent: number;
  await storage.trustlessManagementEvents.update((managementEvents) => {
    managementEvent = managementEvents.push(event) - 1;
  });

  const trustlessManagement = checksumAddress(event.address);
  const dao = checksumAddress(event.dao);
  const role = event.role.toString();

  const permissionChecker = checksumAddress(event.permissionChecker);
  await storage.trustlessManagement.update((tmStorage) => {
    createRoleIfNotExists({ tmStorage: tmStorage, chainId: event.chainId, trustlessManagement: trustlessManagement, dao: dao, role: role });
    const daoInfo = tmStorage[event.chainId][trustlessManagement][dao];
    const permission = daoInfo.permissions[role];
    permission.fullAccess = permissionChecker;

    daoInfo.events.push(managementEvent);
  });
}
