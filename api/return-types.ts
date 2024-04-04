import { IndexedActionRequests } from "../types/trustless-actions";
import { TrustlessActionsEvent } from "../types/trustless-actions-events";
import { IndexedDAOInfo } from "../types/trustless-management";
import { TrustlessManagementEvent } from "../types/trustless-management-events";

export type TrustlessManagementReturn = IndexedDAOInfo;

export type TrustlessManagementEventReturn = TrustlessManagementEvent;

export type TrustlessActionsReturn = IndexedActionRequests;

export type TrustlessActionsEventReturn = TrustlessActionsEvent;
