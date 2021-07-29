import fs from "fs";
import path from "path";
import type { GatsbyNodeServerConfig } from ".."
import type { FrameworkEnum } from "../index"
export const CONFIG_FILE_NAME = "gatsby-plugin-node.json";
export const CONFIG_FILE_PATH = "./public";

export function getConfig(): GatsbyNodeServerConfig {
  const configPath = path.join(CONFIG_FILE_PATH, CONFIG_FILE_NAME)
  if (!fs.existsSync(configPath)) {
    console.error("Unable to find config @ ", configPath)
    throw Error("No Server config found, did you do a production Gatsby Build?")
  }
  return JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8'}));
}

export function getFrameworkPath(framework: FrameworkEnum) {
  return path.resolve(__dirname, `../servers`, `${framework}.js`);
}

export function getPrefix(config: GatsbyNodeServerConfig) {
  return config?.pathPrefix
}

export function hasPrefix(config: GatsbyNodeServerConfig){
  return Boolean(config?.pathPrefix)
}

export function withPrefixGenerator(config: GatsbyNodeServerConfig) {
  return (path = "") => {
    return (getPrefix(config) || "") + path;
  };
}