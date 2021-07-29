import { GatsbyNodeServerConfig } from "..";
import { FrameworkApp } from "..";

export interface FrameworkInterface {
  handleFunctions: () => Promise<void>
  handleStatic: () => void
  handleRedirects: () => void
  handleClientPaths: () => void
  handle404: () => void
}

export type FrameworkInit = (providerApp: FrameworkApp, config: GatsbyNodeServerConfig) => FrameworkInterface