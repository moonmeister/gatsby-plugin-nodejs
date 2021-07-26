import path from "path";
import fastifyStatic from "fastify-static";
import { forEachFunction, forEachRedirect, withPrefixGenerator } from "../utils";
import { getFunctionToExec } from "../utils/functions";

export default function init(app, config) {
  const withPrefix = withPrefixGenerator(config);
  const { redirects, paths } = config;

  function handleFunctions(functions) {
    forEachFunction(functions, (funcConfig) => {
      const route = withPrefix(getRoute(funcConfig));
      const fnToExecute = getFunctionToExec(funcConfig);

      app.all(
        route,
        logFunctionExecution(async (req, reply) => {
          try {
            await Promise.resolve(fnToExecute(req, reply));
          } catch (e) {
            console.error(e);
            // Don't send the error if that would cause another error.
            if (!reply.sent) {
              reply.code(500);
            }
          }
        }),
      );
    });
  }

  function handleStatic() {
    app.ignoreTrailingSlash = true;
    app.register(fastifyStatic, {
      root: path.resolve("./public"),
      prefix: withPrefix("/"),
    });
  }

  function handleRedirects() {
    forEachRedirect(redirects, (r) => {
      app.get(withPrefix(r.fromPath), (req, reply) => {
        const toPath = /https?:\/\//.test(r.toPath) ? r.toPath : withPrefix(r.toPath);
        reply.code(r.statusCode || r.isPermanent ? 301 : 302).redirect(toPath);
      });
    });
  }

  function handleClientPaths() {
    forEachClientPath(paths, () => {
      app.get(withPrefix(p.matchPath), (req, reply) => {
        reply.sendFile("index.html", path.resolve("./public", p.path.replace("/", "")));
      });
    });
  }

  function handle404() {
    app.setNotFoundHandler((req, reply) => {
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
}
