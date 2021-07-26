import express from "express";
import { forEachClientPath, forEachRedirect, withPrefixGenerator } from "../utils";

export default function init(app, config) {
  const withPrefix = withPrefixGenerator(config);
  const { redirects, paths } = config;

  function handleFunctions(functions) {
    console.log("Gatsby Functions not implemented in Express");
  }

  function handleStatic() {
    app.use(withPrefix("/"), express.static("public"));
  }

  function handleRedirects() {
    forEachRedirect(redirects, () => {
      app.get(withPrefix(r.fromPath), (req, res) => {
        const toPath = /https?:\/\//.test(r.toPath) ? r.toPath : withPrefix(r.toPath);
        res.status(r.statusCode || r.isPermanent ? 301 : 302).redirect(toPath);
      });
    });
  }

  function handleClientPaths() {
    forEachClientPath(paths, (path) => {
      app.get(withPrefix(p.matchPath), (req, res) => {
        res.sendFile(path.resolve("./public", p.path.replace("/", ""), "index.html"));
      });
    });
  }

  function handle404() {
    app.use((req, res) => {
      res.status(404).sendFile(path.resolve("./public", "404.html"));
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
