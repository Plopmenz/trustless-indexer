import { Address, Hex } from "viem";

export interface Action {
  to: Address;
  value: bigint;
  data: Hex;
}
