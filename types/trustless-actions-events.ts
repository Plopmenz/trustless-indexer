import { Address, Hex } from "viem";
import { Action } from "./dao";

export interface TrustlessActionsEventBase {
  blockNumber: bigint;
  transactionHash: string;
  chainId: number;
  address: Address;
}

export type TrustlessActionsEvent = ActionCreated | ActionExecuted;

export interface ActionCreated extends TrustlessActionsEventBase {
  type: "ActionCreated";
  id: number;
  dao: Address;
  manager: Address;
  role: bigint;
  actions: readonly Action[];
  failureMap: bigint;
  metadata: string;
}

export interface ActionExecuted extends TrustlessActionsEventBase {
  type: "ActionExecuted";
  id: number;
  dao: Address;
  executor: Address;
  returnValues: Hex[];
  failureMap: bigint;
}
