import path from "path";
import fastifyStatic from "fastify-static";
import { forEachFunction, getFunctionManifest } from "../utils/functions";
import { forEachClientPath } from "../utils/clientPaths";
import { forEachRedirect, getResponseCode } from "../utils/redirects";
import { withPrefixGenerator } from "../utils/general";
import { FrameworkInit } from "..";

import { FastifyInstance } from "fastify";

export const init: FrameworkInit<FastifyInstance> = (app, config) => {
  const { redirects, paths } = config;
  const withPrefix = withPrefixGenerator(config);

  async function handleFunctions() {
    const functions = getFunctionManifest();
    forEachFunction(functions, async ({ route, fnToExecute }) => {
      app.all(withPrefix(route), {
        handler: async function (req, reply) {
          try {
            await Promise.resolve(fnToExecute(req, reply));
          } catch (e) {
            console.error(e);
            // Don't send the error if that would cause another error.
            if (!reply.sent) {
              reply.code(500).send("Error executing Gatsby Funciton.");
            }
          }
        },
      });
    });
  }

  function handleStatic() {
    app.register(fastifyStatic, {
      root: path.resolve("./public"),
      prefix: withPrefix("/"),
      redirect: true,
      wildcard: true,
    });
  }

  function handleRedirects() {
    forEachRedirect(redirects, (r) => {
      app.get(withPrefix(r.fromPath), (_req, reply) => {
        const toPath = /https?:\/\//.test(r.toPath) ? r.toPath : withPrefix(r.toPath);
        reply.code(getResponseCode(r)).redirect(toPath);
      });
    });
  }


  //TODO: This isn't working
  function handleClientPaths() {
    forEachClientPath(paths, (p) => {
      console.log("folder path", path.resolve("./public", p.path.replace("/", "")), withPrefix(p.matchPath));

      app.get(withPrefix(p.matchPath), (_req, reply) => {
        console.log("matched path");
        reply.sendFile("index.html", path.resolve("./public", p.path.replace("/", "")));
      });
    });
  }

  function handle404() {
    app.setNotFoundHandler((_req, reply) => {
      reply.code(404).sendFile("404.html", path.resolve("./public"));
    });
  }

  return {
    handleFunctions,
    handleStatic,
    handleRedirects,
    handleClientPaths,
    handle404,
  };
};
