import { config as loadEnv } from "dotenv";
import express from "express";
import storageManager from "node-persist";
import { Address } from "viem";
import { mainnet, polygon, polygonMumbai, sepolia } from "viem/chains";

import { registerRoutes } from "./api/simple-router.js";
import { MultischainWatcher } from "./utils/multichain-watcher.js";
import { PersistentJson } from "./utils/persistent-json.js";
import { IndexedDAOInfo } from "./types/trustless-management.js";
import { TrustlessManagementEvent } from "./types/trustless-management-events.js";
import { IndexedActionRequests } from "./types/trustless-actions.js";
import { TrustlessActionsEvent } from "./types/trustless-actions-events.js";
import { watchFunctionBlacklistChanged } from "./event-watchers/trustless-management/FunctionBlacklistChanged.js";
import { watchZoneBlacklistChanged } from "./event-watchers/trustless-management/ZoneBlacklistChanged.js";
import { watchFullAccessChanged } from "./event-watchers/trustless-management/FullAccessChanged.js";
import { watchZoneAccessChanged } from "./event-watchers/trustless-management/ZoneAccessChanged.js";
import { watchFunctionAccessChanged } from "./event-watchers/trustless-management/FunctionAccessChanged.js";
import { watchActionCreated } from "./event-watchers/trustless-actions/ActionCreated.js";
import { watchActionExecuted } from "./event-watchers/trustless-actions/ActionExecuted.js";

export interface TrustlessManagementStorage {
  [chainId: number]: {
    [trustlessManagement: Address]: {
      [dao: Address]: IndexedDAOInfo;
    };
  };
}
export type TrustlessManagementEventsStorage = TrustlessManagementEvent[];

export interface TrustlessActionsStorage {
  [chainId: number]: {
    [trustlessActions: Address]: {
      [dao: Address]: IndexedActionRequests;
    };
  };
}
export type TrustlessActionsEventsStorage = TrustlessActionsEvent[];

export interface Storage {
  trustlessManagement: PersistentJson<TrustlessManagementStorage>;
  trustlessManagementEvents: PersistentJson<TrustlessManagementEventsStorage>;

  trustlessActions: PersistentJson<TrustlessActionsStorage>;
  trustlessActionsEvents: PersistentJson<TrustlessActionsEventsStorage>;
}

async function start() {
  const loadEnvResult = loadEnv();
  if (loadEnvResult.error) {
    console.warn(`Error while loading .env: ${loadEnvResult.error}`);
  }

  // Make contract watcher for each chain (using Infura provider)
  const multichainWatcher = new MultischainWatcher([
    {
      chain: mainnet,
      infuraPrefix: "mainnet",
    },
    {
      chain: sepolia,
      infuraPrefix: "sepolia",
    },
    {
      chain: polygon,
      infuraPrefix: "polygon-mainnet",
    },
    {
      chain: polygonMumbai,
      infuraPrefix: "polygon-mumbai",
    },
  ]);

  // Data (memory + json files (synced) currently, could be migrated to a database solution if needed in the future)
  await storageManager.init({ dir: "storage" });
  const storage = {
    trustlessManagement: new PersistentJson<TrustlessManagementStorage>("trustlessManagement", {}),
    trustlessManagementEvents: new PersistentJson<TrustlessManagementEventsStorage>("trustlessManagementEvents", []),

    trustlessActions: new PersistentJson<TrustlessActionsStorage>("trustlessActions", {}),
    trustlessActionsEvents: new PersistentJson<TrustlessActionsEventsStorage>("trustlessActionsEvents", []),
  };

  multichainWatcher.forEach((contractWatcher) => {
    watchFunctionBlacklistChanged(contractWatcher, storage);
    watchZoneBlacklistChanged(contractWatcher, storage);
    watchFullAccessChanged(contractWatcher, storage);
    watchZoneAccessChanged(contractWatcher, storage);
    watchFunctionAccessChanged(contractWatcher, storage);

    watchActionCreated(contractWatcher, storage);
    watchActionExecuted(contractWatcher, storage);
  });

  process.on("SIGINT", function () {
    console.log("Stopping...");

    multichainWatcher.forEach((contractWatcher) => {
      contractWatcher.stopAll();
    });
    process.exit();
  });

  // Webserver
  const app = express();
  registerRoutes(app, storage);

  var server = app.listen(3001, () => {
    const addressInfo = server.address() as any;
    var host = addressInfo.address;
    var port = addressInfo.port;
    console.log(`Webserver started on ${host}:${port}`);
  });
}

start().catch(console.error);
