import path from "path";
import fs from "fs";
import { IGatsbyFunction } from "gatsby/dist/redux/types";

const PATH_TO_FUNCTIONS = "./.cache/functions/";

export function getRoute({ functionRoute }: IGatsbyFunction) {
  return path.posix.join("/api", functionRoute);
}

export type GatsbyFunctionHandler = (req: object, res: object) => void | Promise<void>;

async function getFunctionToExec({
  relativeCompiledFilePath,
}: IGatsbyFunction): Promise<GatsbyFunctionHandler | null> {
  const funcImportAbsPath = path.resolve(PATH_TO_FUNCTIONS, relativeCompiledFilePath);

  if (!fs.existsSync(funcImportAbsPath)) {
    console.error("Unable to find function to import @ ", funcImportAbsPath);
    return null;
  }

  const func = await import(funcImportAbsPath);
  return func?.default ?? func;
}

export async function getFunctionHandler(routeConfig: IGatsbyFunction) {
  const execFunction = await getFunctionToExec(routeConfig);

  if (!execFunction) {
    return null;
  }
  return logFunctionExec(execFunction, getRoute(routeConfig));
}

export type FunctionRouteBuilder = ({
  route,
  fnToExecute,
}: {
  route: string;
  fnToExecute: GatsbyFunctionHandler;
}) => void;

export async function forEachFunction(
  functions: IGatsbyFunction[],
  handleFunction: FunctionRouteBuilder,
) {
  if (functions?.length > 0) {
    for (const funcConfig of functions) {
      const route = getRoute(funcConfig);
      const fnToExecute = await getFunctionHandler(funcConfig);

      if (fnToExecute) {
        console.info("Registering Gatsby Function: ", route);
        await Promise.resolve(handleFunction({ route, fnToExecute }));
      }
    }
  }
}

function logFunctionExec(func: GatsbyFunctionHandler, path: string): GatsbyFunctionHandler {
  return async (req, res) => {
    const start = Date.now();

    await func(req, res);

    const end = Date.now();
    console.info(`Executed function "${path}" in ${end - start}ms`);
  };
}

export function getFunctionManifest(): IGatsbyFunction[] {
  const compiledFunctionsDir = path.resolve(`.cache`, `functions`);
  let functions: IGatsbyFunction[] = [];

  if (!fs.existsSync(compiledFunctionsDir)) {
    console.error("Unable to find funciton mainfest @ ", compiledFunctionsDir);
    return functions;
  }

  try {
    functions = JSON.parse(
      fs.readFileSync(path.join(compiledFunctionsDir, `manifest.json`), `utf-8`),
    );
  } catch (e) {
    // ignore
  }

  return functions;
}
