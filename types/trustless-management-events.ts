import { Address, Hex } from "viem";

export interface TrustlessManagementEventBase {
  blockNumber: bigint;
  transactionHash: string;
  chainId: number;
  address: Address;
}

export type TrustlessManagementEvent = FunctionBlacklistChanged | ZoneBlacklistChanged | FullAccessChanged | ZoneAccessChanged | FunctionAccessChanged;

export interface FunctionBlacklistChanged extends TrustlessManagementEventBase {
  type: "FunctionBlacklistChanged";
  dao: Address;
  role: bigint;
  zone: Address;
  functionSelector: Hex;
  permissionChecker: Address;
}

export interface ZoneBlacklistChanged extends TrustlessManagementEventBase {
  type: "ZoneBlacklistChanged";
  dao: Address;
  role: bigint;
  zone: Address;
  permissionChecker: Address;
}

export interface FullAccessChanged extends TrustlessManagementEventBase {
  type: "FullAccessChanged";
  dao: Address;
  role: bigint;
  permissionChecker: Address;
}

export interface ZoneAccessChanged extends TrustlessManagementEventBase {
  type: "ZoneAccessChanged";
  dao: Address;
  role: bigint;
  zone: Address;
  permissionChecker: Address;
}

export interface FunctionAccessChanged extends TrustlessManagementEventBase {
  type: "FunctionAccessChanged";
  dao: Address;
  role: bigint;
  zone: Address;
  functionSelector: Hex;
  permissionChecker: Address;
}
