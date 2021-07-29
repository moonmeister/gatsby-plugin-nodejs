import express, { Application as ExpressApp } from "express";
import path from "path";
import { getPrefix } from "../utils/general";
import { forEachFunction, getFunctionManifest } from "../utils/functions";
import { forEachClientPath } from "../utils/clientPaths";
import { forEachRedirect, getResponseCode } from "../utils/redirects";
import { FrameworkInit } from "..";

export const init: FrameworkInit<ExpressApp> = (providedApp, config) => {
  let app = providedApp;
  const { redirects, paths } = config;

  function handlePrefix() {
    console.log("handling prefix");
    const prefix = getPrefix(config);
    const gatsby = express();
    providedApp.use(prefix, gatsby);
    app = gatsby;
  }

  async function handleFunctions() {
    const functions = getFunctionManifest();
    forEachFunction(functions, async ({ route, fnToExecute }) => {
      console.log("HELLLLLOOOO!!!!");
      app.all(route, async (req, res) => {
        try {
          console.log("trying to execute function");
          await Promise.resolve(fnToExecute(req, res));
        } catch (e) {
          console.error(e);
          // Don't send the error if that would cause another error.
          if (!res.headersSent) {
            res.sendStatus(500);
          }
        }
      });
      app.use("/api", (_req, res) => {
        console.log("Is this excecuting?");
        res.status(200).send("Hello, world");
      });
    });
  }

  function handleStatic() {
    app.use("/", express.static("public"));
  }

  function handleRedirects() {
    forEachRedirect(redirects, (r) => {
      app.get(r.fromPath, (_req, res) => {
        res.status(getResponseCode(r)).redirect(r.toPath);
      });
    });
  }

  function handleClientPaths() {
    forEachClientPath(paths, (p) => {
      app.get(p.matchPath, (_req, res) => {
        res.sendFile(path.resolve("./public", p.path.replace("/", ""), "index.html"));
      });
    });
  }

  function handle404() {
    app.use((_req, res) => {
      res.status(404).sendFile(path.resolve("./public", "404.html"));
    });
  }

  return {
    handlePrefix,
    handleFunctions,
    handleStatic,
    handleRedirects,
    handleClientPaths,
    handle404,
  };
};
