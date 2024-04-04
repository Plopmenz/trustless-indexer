import { Address, Hex, zeroAddress } from "viem";

import { TrustlessManagementStorage } from "../..";

export interface CreateChainSettings {
  tmStorage: TrustlessManagementStorage;
  chainId: number;
}
export function createChainIfNotExists(settings: CreateChainSettings): void {
  const { tmStorage, chainId } = settings;
  if (!tmStorage[chainId]) {
    tmStorage[chainId] = {};
  }
}

export interface CreateTrustlessManagementSettings extends CreateChainSettings {
  trustlessManagement: Address;
}
export function createTrustlessManagementIfNotExists(settings: CreateTrustlessManagementSettings): void {
  const { tmStorage, chainId, trustlessManagement } = settings;
  createChainIfNotExists(settings);
  if (!tmStorage[chainId][trustlessManagement]) {
    tmStorage[chainId][trustlessManagement] = {};
  }
}

export interface CreateDAOSettings extends CreateTrustlessManagementSettings {
  dao: Address;
}
export function createDAOIfNotExists(settings: CreateDAOSettings): void {
  const { tmStorage, chainId, trustlessManagement, dao } = settings;
  createTrustlessManagementIfNotExists(settings);
  if (!tmStorage[chainId][trustlessManagement][dao]) {
    tmStorage[chainId][trustlessManagement][dao] = {
      admin: zeroAddress,
      permissions: {},

      events: [],
    };
  }
}

export interface CreateRoleSettings extends CreateDAOSettings {
  role: string;
}
export function createRoleIfNotExists(settings: CreateRoleSettings): void {
  const { tmStorage, chainId, trustlessManagement, dao, role } = settings;
  createDAOIfNotExists(settings);
  if (!tmStorage[chainId][trustlessManagement][dao].permissions[role]) {
    tmStorage[chainId][trustlessManagement][dao].permissions[role] = {
      fullAccess: zeroAddress,
      functionAccess: {},
      functionBlacklist: {},
      zoneAccess: {},
      zoneBlacklist: {},
    };
  }
}

export function calculateFunctionId(zone: Address, functionSelector: Hex): string {
  return (BigInt(zone) << (BigInt(32) + BigInt(functionSelector))).toString();
}
