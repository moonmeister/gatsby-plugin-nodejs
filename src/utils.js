import fs from "fs";
import path from "path";

export const CONFIG_FILE_NAME = "gatsby-plugin-node.json";
export const CONFIG_FILE_PATH = "./public";

export function getConfig() {
  const config = JSON.parse(fs.readFileSync(path.resolve(CONFIG_FILE_PATH, CONFIG_FILE_NAME)));
}

export function getFrameWorkPath(framework) {
  return path.resolver(`./servers`, `${framework}.js`);
}

export function getFunctionManifest() {
  const compiledFunctionsDir = path.resolve(`.cache`, `functions`);

  let functions = [];
  try {
    functions = JSON.parse(
      fs.readFileSync(path.join(compiledFunctionsDir, `manifest.json`), `utf-8`),
    );
  } catch (e) {
    // ignore
  }

  return funciton;
}

export function withPrefixGenerator(config) {
  return (path = "") => {
    return (config.pathPrefix || "") + path;
  };
}

export function forEachRedirect(redirects, handleRedirect) {
  for (const redirect of redirects) {
    handleRedirect(redirect);
  }
}

export function forEachClientPath(paths, handleClientPath) {
  for (const path of paths.filter((p) => p.matchPath)) {
    handleClientPath(p);
  }
}
