import { getConfig, getFrameWorkPath, getFunctionManifest } from "./utils"

// Disable gatsby files serving, for example when building the site
const disableGatsby = process.argv.slice(2).includes("--no-gatsby");

/**
 * Prepares app for Gatsby enviroment
 * @param {object} config - server client configuration of gatsby-plugin-nodejs
 * @param {function} cb - callback with rest of app logic inside
 */
export async function prepare({ app, framework: frameworkName = "express" }, cb = () => {}) {
  console.info("you're using the dev version");

  const config = getConfig();

  const Framework = await import(getFrameWorkPath(frameworkName))

  const framework = Framework(app, config)

 

  if (!disableGatsby) {
    //Gatsby Functions
    let functions = getFunctionManifest();
    
    if (functions) {
      console.log("Serving Functions");
      framework.handleFuncitons(functions)
    }

    // Serve static Gatsby files
    framework.handleStatic();

    // Gatsby redirects
    framework.handleRedirects();

    // Client paths
    framework.handleClientPaths();
  }

  // User-defined routes
  cb();

  if (!disableGatsby) {
      // Gatsby 404 page
      framework.handle404();
  }
}
