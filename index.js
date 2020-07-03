const path = require("path");
const fs = require("fs");

/**
 * Prepares app for Gatsby enviroment
 * @param {object} {app} - server client configuration of gatsby-plugin-nodejs
 * @param {function} cb - callback with rest of app logic inside
 */
function prepare({ app, framework = "express", pathPrefix = "/" }, cb) {
  const config = JSON.parse(fs.readFileSync(path.resolve("./public", "gatsby-plugin-node.json")));

  switch (framework) {
    case "express":
      const express = require("express");
      app.use(pathPrefix, express.static("public"));
      break;
    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }

  cb();

  switch (framework) {
    case "express":
      app.use((req, res) => {
        res.sendFile(path.resolve("./public", "404.html"));
      });
  }
}

module.exports = {
  prepare,
};
