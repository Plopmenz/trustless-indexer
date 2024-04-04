import { Express, Response, json } from "express";
import { checksumAddress, isAddress } from "viem";

import { Storage } from "..";
import { replacer } from "../utils/json.js";

function malformedRequest(res: Response, error: string): void {
  res.statusCode = 400;
  res.end(error);
}

export function registerRoutes(app: Express, storage: Storage) {
  const basePath = "/indexer/";
  app.use(json());

  // Get single dao from a certain trustless management contract
  app.get(basePath + "trustlessManagement/:chainId/:trustlessManagement/:dao", async function (req, res) {
    const chainId = parseInt(req.params.chainId);
    if (Number.isNaN(chainId)) {
      return malformedRequest(res, "chainId is not a valid number");
    }

    if (!isAddress(req.params.trustlessManagement)) {
      return malformedRequest(res, "trustlessManagement is not a valid address");
    }
    const trustlessManagement = checksumAddress(req.params.trustlessManagement);

    if (!isAddress(req.params.dao)) {
      return malformedRequest(res, "dao is not a valid address");
    }
    const dao = checksumAddress(req.params.dao);

    const tmStorage = await storage.trustlessManagement.get();
    if (!tmStorage[chainId]) {
      res.statusCode = 404;
      return res.end("Chain not found");
    }

    if (!tmStorage[chainId][trustlessManagement]) {
      res.statusCode = 404;
      return res.end("Trustless management not found");
    }

    const daoInfo = tmStorage[chainId][trustlessManagement][dao];
    if (!daoInfo) {
      res.statusCode = 404;
      return res.end("Dao not found");
    }

    res.end(JSON.stringify(daoInfo, replacer));
  });

  // Get single trustless management event (newer events have higher index)
  app.get(basePath + "trustlessManagementEvent/:eventIndex", async function (req, res) {
    const eventIndex = parseInt(req.params.eventIndex);
    if (Number.isNaN(eventIndex)) {
      return malformedRequest(res, "eventIndex is not a valid number");
    }

    const managementEvents = await storage.trustlessManagementEvents.get();
    const event = managementEvents[eventIndex];

    if (!event) {
      res.statusCode = 404;
      return res.end("Event not found");
    }

    res.end(JSON.stringify(event, replacer));
  });

  // Get single dao from a certain trustless management contract
  app.get(basePath + "trustlessActions/:chainId/:trustlessActions/:dao", async function (req, res) {
    const chainId = parseInt(req.params.chainId);
    if (Number.isNaN(chainId)) {
      return malformedRequest(res, "chainId is not a valid number");
    }

    if (!isAddress(req.params.trustlessActions)) {
      return malformedRequest(res, "trustlessActions is not a valid address");
    }
    const trustlessActions = checksumAddress(req.params.trustlessActions);

    if (!isAddress(req.params.dao)) {
      return malformedRequest(res, "dao is not a valid address");
    }
    const dao = checksumAddress(req.params.dao);

    const taStorage = await storage.trustlessActions.get();
    if (!taStorage[chainId]) {
      res.statusCode = 404;
      return res.end("Chain not found");
    }

    if (!taStorage[chainId][trustlessActions]) {
      res.statusCode = 404;
      return res.end("Trustless actions not found");
    }

    const requests = taStorage[chainId][trustlessActions][dao];
    if (!requests) {
      res.statusCode = 404;
      return res.end("Dao not found");
    }

    res.end(JSON.stringify(requests, replacer));
  });

  // Get single trustless actions event (newer events have higher index)
  app.get(basePath + "trustlessActionsEvent/:eventIndex", async function (req, res) {
    const eventIndex = parseInt(req.params.eventIndex);
    if (Number.isNaN(eventIndex)) {
      return malformedRequest(res, "eventIndex is not a valid number");
    }

    const actionsEvents = await storage.trustlessActionsEvents.get();
    const event = actionsEvents[eventIndex];

    if (!event) {
      res.statusCode = 404;
      return res.end("Event not found");
    }

    res.end(JSON.stringify(event, replacer));
  });
}
