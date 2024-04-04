import { checksumAddress } from "viem";

import { Storage } from "../../index.js";
import { ContractWatcher } from "../../utils/contract-watcher.js";
import { fetchMetadata } from "../../utils/metadata-fetch.js";
import { ActionCreated } from "../../types/trustless-actions-events.js";
import { TrustlessActionsContract } from "../../contracts/TrustlessActions.js";
import { createRequestIfNotExists } from "./trustlessActionsHelpers.js";

export function watchActionCreated(contractWatcher: ContractWatcher, storage: Storage) {
  contractWatcher.startWatching("ActionCreated", {
    abi: TrustlessActionsContract.abi,
    // All addresses
    eventName: "ActionCreated",
    strict: true,
    onLogs: async (logs) => {
      await Promise.all(
        logs.map(async (log) => {
          const { args, blockNumber, transactionHash, address } = log;

          const event = {
            type: "ActionCreated",
            blockNumber: blockNumber,
            transactionHash: transactionHash,
            chainId: contractWatcher.chain.id,
            address: address,
            ...args,
          } as ActionCreated;

          await processActionCreated(event, storage);
        })
      );
    },
  });
}

export async function processActionCreated(event: ActionCreated, storage: Storage): Promise<void> {
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
    request.manager = event.manager;
    request.role = event.role;
    request.actions = [...event.actions];
    request.failureMap = event.failureMap;
    request.metadata = event.metadata;

    requests.events.push(actionsEvent);
  });

  await fetchMetadata(event.metadata)
    .then((metadata) =>
      storage.trustlessActions.update((taStorage) => {
        taStorage[event.chainId][trustlessActions][dao].getRequest[event.id].cachedMetadata = metadata;
      })
    )
    .catch((err) =>
      console.error(`Error while fetching trustless action metadata ${event.metadata} (${event.chainId}-${trustlessActions}-${dao}-${event.id}): ${err}`)
    );
}
