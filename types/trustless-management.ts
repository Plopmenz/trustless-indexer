import { Address } from "viem";

export type PermissionChecker = Address;

export interface PermissionInfo {
  fullAccess: PermissionChecker;
  zoneAccess: { [zone: Address]: PermissionChecker };
  zoneBlacklist: { [zone: Address]: PermissionChecker };
  functionAccess: { [functionId: string]: PermissionChecker };
  functionBlacklist: { [functionId: string]: PermissionChecker };
}

export interface DAOInfo {
  admin: Address;
  permissions: { [role: string]: PermissionInfo };
}

export interface IndexedDAOInfo extends DAOInfo {
  events: number[];
}
