import { getConfig, getFrameworkPath, hasPrefix } from "./utils/general";
import type { FastifyInstance } from "fastify"
import type { Application as ExpressInstance } from "express"
import type { GatsbyReduxStore } from "gatsby/dist/redux"
import type { IRedirect } from "gatsby/dist/redux/types";

export type ConfigPage = {
  matchPath: string | undefined;
  path: string;
}

export type GatsbyNodeServerConfig = {
  paths: ConfigPage[];
  redirects: IRedirect[];
  pathPrefix: string;
}

export type GatsbyApiInput ={ pathPrefix: string, store: GatsbyReduxStore};// Disable gatsby files serving, for example when building the site
const disableGatsby = process.argv.slice(2).includes("--no-gatsby");

export enum FrameworkEnum {
  Express = "express",
  Fastify = "fastify"
}

export type FrameworkApp = FastifyInstance | ExpressInstance

export interface FrameworkInterface {
  handleFunctions: () => Promise<void>
  handleStatic: () => void
  handleRedirects: () => void
  handleClientPaths: () => void
  handle404: () => void
  handlePrefix?: () => void
}

export type FrameworkInit<I> = (providerApp: I, config: GatsbyNodeServerConfig) => FrameworkInterface

export interface Framework {
  init: FrameworkInit<FrameworkApp>
}

//Prepares apps for running gatsby
export async function prepare({ app , framework: frameworkName = FrameworkEnum.Express }: { app: FrameworkApp, framework: FrameworkEnum }) {
  console.info("you're using the dev version");

  const config = getConfig();
  const Framework: Framework = await import(getFrameworkPath(frameworkName)) ;

  const framework = Framework.init(app, config);

  if (!disableGatsby) {
    // Path Prefix
    if (hasPrefix(config) && framework?.handlePrefix) {
      framework.handlePrefix();
    }

    // Gatsby Functions
    await framework.handleFunctions();

    // app.get("/api/test", (req, res) => {
    //   res.status(200).send("Hello, world!");
    // })

    // Serve static Gatsby files
    framework.handleStatic();

    // Gatsby redirects
    framework.handleRedirects();

    // Client paths
    framework.handleClientPaths();

    // Gatsby 404 page
    framework.handle404();
  }
}
