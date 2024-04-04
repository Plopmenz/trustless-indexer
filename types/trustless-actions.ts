import { Address } from "viem";
import { Action } from "./dao";

export interface ActionRequest {
  executed: boolean;
  manager: Address;
  role: bigint;
  actions: Action[];
  failureMap: bigint;
}

export interface IndexedActionRequest extends ActionRequest {
  metadata: string;
  cachedMetadata: string;
  executedBy: Address;
}

export interface ActionRequests {
  getRequest: { [id: number]: ActionRequest };
}

export interface IndexedActionRequests extends ActionRequests {
  getRequest: { [id: number]: IndexedActionRequest };

  events: number[];
}
