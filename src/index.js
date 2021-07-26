import { getConfig, getFrameworkPath } from "./utils/general";

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
  console.log(getFrameworkPath(frameworkName));
  const Framework = await import(getFrameworkPath(frameworkName));

  const framework = Framework.init(app, config);

  if (!disableGatsby) {
    // Gatsby Functions
    framework.handleFunctions();

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
