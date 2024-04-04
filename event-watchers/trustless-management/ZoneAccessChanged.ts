import { checksumAddress } from "viem";

import { Storage } from "../../index.js";
import { ContractWatcher } from "../../utils/contract-watcher.js";
import { ZoneAccessChanged } from "../../types/trustless-management-events.js";
import { TrustlessManagementContract } from "../../contracts/TrustlessManagement.js";
import { createRoleIfNotExists, calculateFunctionId } from "./trustlessManagementHelpers.js";

export function watchZoneAccessChanged(contractWatcher: ContractWatcher, storage: Storage) {
  contractWatcher.startWatching("ZoneAccessChanged", {
    abi: TrustlessManagementContract.abi,
    // All addresses
    eventName: "ZoneAccessChanged",
    strict: true,
    onLogs: async (logs) => {
      await Promise.all(
        logs.map(async (log) => {
          const { args, blockNumber, transactionHash, address } = log;

          const event = {
            type: "ZoneAccessChanged",
            blockNumber: blockNumber,
            transactionHash: transactionHash,
            chainId: contractWatcher.chain.id,
            address: address,
            ...args,
          } as ZoneAccessChanged;

          await processZoneAccessChanged(event, storage);
        })
      );
    },
  });
}

export async function processZoneAccessChanged(event: ZoneAccessChanged, storage: Storage): Promise<void> {
  let managementEvent: number;
  await storage.trustlessManagementEvents.update((managementEvents) => {
    managementEvent = managementEvents.push(event) - 1;
  });

  const trustlessManagement = checksumAddress(event.address);
  const dao = checksumAddress(event.dao);
  const role = event.role.toString();

  const zone = checksumAddress(event.zone);
  const permissionChecker = checksumAddress(event.permissionChecker);
  await storage.trustlessManagement.update((tmStorage) => {
    createRoleIfNotExists({ tmStorage: tmStorage, chainId: event.chainId, trustlessManagement: trustlessManagement, dao: dao, role: role });
    const daoInfo = tmStorage[event.chainId][trustlessManagement][dao];
    const permission = daoInfo.permissions[role];
    permission.zoneAccess[zone] = permissionChecker;

    daoInfo.events.push(managementEvent);
  });
}
