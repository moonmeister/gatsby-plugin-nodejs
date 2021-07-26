import fs from "fs";
import path from "path";

export const CONFIG_FILE_NAME = "gatsby-plugin-node.json";
export const CONFIG_FILE_PATH = "./public";

export function getConfig() {
  return JSON.parse(fs.readFileSync(path.resolve(CONFIG_FILE_PATH, CONFIG_FILE_NAME)));
}

export function getFrameworkPath(framework) {
  return path.resolve(__dirname, `../servers`, `${framework}.js`);
}

export function withPrefixGenerator(config) {
  return (path = "") => {
    return (config.pathPrefix || "") + path;
  };
}