import path from "path"

const PATH_TO_FUNCTIONS = './.cache/functions/';

export function getRoute({ functionRoute }) {
  return path.posix.resolve("/api", functionRoute)
}

export async function getFunctionToExec({ relativeCompiledFilePath }) {
  const func = await import(path.resolve(PATH_TO_FUNCTIONS, relativeCompiledFilePath));
  return func?.default ?? func;
}

export function forEachFunction(functions, handleFunction) {
  for (const funcConfig of functions) {
    handleFunction(funcConfig);
  }
}

export async function logFunctionExec(func) {
  return async (req, res) => {
    const start = Date.now();

    await func(req, res);

    const end = Date.now();
    console.log(`Executed function "/api/${functionObj.functionRoute}" in ${end - start}ms`);
  };
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

  return functions;
}