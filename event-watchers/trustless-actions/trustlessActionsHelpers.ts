import { Address, zeroAddress } from "viem";

import { TrustlessActionsStorage } from "../..";

export interface CreateChainSettings {
  taStorage: TrustlessActionsStorage;
  chainId: number;
}
export function createChainIfNotExists(settings: CreateChainSettings): void {
  const { taStorage, chainId } = settings;
  if (!taStorage[chainId]) {
    taStorage[chainId] = {};
  }
}

export interface CreateTrustlessActionsSettings extends CreateChainSettings {
  trustlessActions: Address;
}
export function createTrustlessActionsIfNotExists(settings: CreateTrustlessActionsSettings): void {
  const { taStorage, chainId, trustlessActions } = settings;
  createChainIfNotExists(settings);
  if (!taStorage[chainId][trustlessActions]) {
    taStorage[chainId][trustlessActions] = {};
  }
}

export interface CreateDAOSettings extends CreateTrustlessActionsSettings {
  dao: Address;
}
export function createDAOIfNotExists(settings: CreateDAOSettings): void {
  const { taStorage, chainId, trustlessActions, dao } = settings;
  createTrustlessActionsIfNotExists(settings);
  if (!taStorage[chainId][trustlessActions][dao]) {
    taStorage[chainId][trustlessActions][dao] = {
      getRequest: {},

      events: [],
    };
  }
}

export interface CreateRequestSettings extends CreateDAOSettings {
  requestId: number;
}
export function createRequestIfNotExists(settings: CreateRequestSettings): void {
  const { taStorage, chainId, trustlessActions, dao, requestId } = settings;
  createDAOIfNotExists(settings);
  if (!taStorage[chainId][trustlessActions][dao].getRequest[requestId]) {
    taStorage[chainId][trustlessActions][dao].getRequest[requestId] = {
      actions: [],
      executed: false,
      failureMap: BigInt(0),
      manager: zeroAddress,
      role: BigInt(0),

      cachedMetadata: "",
      executedBy: zeroAddress,
      metadata: "",
    };
  }
}
