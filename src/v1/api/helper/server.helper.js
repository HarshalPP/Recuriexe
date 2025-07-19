const pm2 = require("pm2");
const dotenv = require('dotenv');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const STAGE_ENV_DIR = path.resolve("/home/nikit/projects/loan-backend-stage"); // Directory where .env files are located
const PROD_ENV_DIR = path.resolve("/home/nikit/projects/finexe-server-prod"); // Directory where .env files are located

// Utility Functions

/**
 * Loads and parses a .env file.
 * @param {string} envName - Name of the environment (e.g., 'stage', 'production').
 * @returns {Promise<Object>} - Parsed key-value pairs.
 */
const loadEnvFile = async (envName) => {
    const envPath = envName == 'stage'? path.join(STAGE_ENV_DIR, `.env`): path.join(PROD_ENV_DIR, `.env`)
  try {
    const envFile = await fs.readFile(envPath, "utf-8");
    const parsed = dotenv.parse(envFile);
    return parsed;
  } catch (error) {
    throw new Error(`Error reading .env.${envName}: ${error.message}`);
  }
};

/**
 * Writes key-value pairs to a .env file.
 * @param {string} envName - Name of the environment (e.g., 'stage', 'production').
 * @param {Object} newVars - Key-value pairs to add or update.
 * @returns {Promise<void>}
 */
const writeEnvFile = async (envName, newVars) => {
    const envPath = envName === 'stage'
    ? path.join(STAGE_ENV_DIR, `.env`)
    : path.join(PROD_ENV_DIR, `.env`);

  try {
    // Convert newVars to .env string
    const envString = Object.entries(newVars)
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Write to the .env file, overwriting existing content
    await fs.writeFile(envPath, envString, "utf-8");
  } catch (error) {
    throw new Error(`Error writing to .env.${envName}: ${error.message}`);
  }
};

/**
 * Reloads a PM2 process to apply new environment variables.
 * @param {string} processName - Name of the PM2 process to reload.
 * @returns {Promise<void>}
 */
const reloadPM2Process = async (processName) => {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        return reject(new Error(`PM2 Connection Error: ${err.message}`));
      }

      pm2.restart(processName, (err, proc) => {
        pm2.disconnect();
        if (err) {
          return reject(new Error(`PM2 Restart Error: ${err.message}`));
        }
        resolve();
      });
    });
  });
};

module.exports = {
  reloadPM2Process,
  loadEnvFile,
  writeEnvFile,
};
