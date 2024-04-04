import { checksumAddress } from "viem";

import { Storage } from "../../index.js";
import { ContractWatcher } from "../../utils/contract-watcher.js";
import { ActionExecuted } from "../../types/trustless-actions-events.js";
import { TrustlessActionsContract } from "../../contracts/TrustlessActions.js";
import { createRequestIfNotExists } from "./trustlessActionsHelpers.js";

export function watchActionExecuted(contractWatcher: ContractWatcher, storage: Storage) {
  contractWatcher.startWatching("ActionExecuted", {
    abi: TrustlessActionsContract.abi,
    // All addresses
    eventName: "ActionExecuted",
    strict: true,
    onLogs: async (logs) => {
      await Promise.all(
        logs.map(async (log) => {
          const { args, blockNumber, transactionHash, address } = log;

          const event = {
            type: "ActionExecuted",
            blockNumber: blockNumber,
            transactionHash: transactionHash,
            chainId: contractWatcher.chain.id,
            address: address,
            ...args,
          } as ActionExecuted;

          await processActionExecuted(event, storage);
        })
      );
    },
  });
}

export async function processActionExecuted(event: ActionExecuted, storage: Storage): Promise<void> {
  let actionsEvent: number;
  await storage.trustlessActionsEvents.update((actionsEvents) => {
    actionsEvent = actionsEvents.push(event) - 1;
  });

  const trustlessActions = checksumAddress(event.address);
  const dao = checksumAddress(event.dao);
  await storage.trustlessActions.update((taStorage) => {
    createRequestIfNotExists({ taStorage: taStorage, chainId: event.chainId, trustlessActions: trustlessActions, dao: dao, requestId: event.id });
    const requests = taStorage[event.chainId][trustlessActions][dao];
    const request = requests.getRequest[event.id];
    request.executed = true;
    request.executedBy = event.executor;

    requests.events.push(actionsEvent);
  });
}
