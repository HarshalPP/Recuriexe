import express from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { createRequire } from "module";
import packageJson from "../../../../package.json"  with { type: "json" };

import path from "path";
import fs from "fs";

const routesPath = path.resolve("src/v1/api/routes");

const { version } = packageJson;
const Base_Url = process.env.BASE_URL || "http://localhost:4000"; 

import log from "./logger.js";



const getAllRouteFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
          getAllRouteFiles(filePath, fileList);
      } else if (file.endsWith(".js")) {
          fileList.push(filePath);
      }
  });
  return fileList;
};

// Swagger options
const options = {
  definition: {
    openapi: "3.0.0", 
    info: {
      title: "REST API DOCS",
      description: "API endpoints for Zoho mail services",
      contact: {
        name: "fincooper",
        email: "info@miniblog.com",
        url: "https://finexe.fincooper.in/",
      },
      version: version,
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local server"
      },
      {
        url: "<your live url here>", 
        description: "Live server"
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: getAllRouteFiles(routesPath), // Dynamically load all route files 
};

// Generate Swagger docs
const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, port) {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  log.info(`Docs available at ${Base_Url}/docs`); 
}

export default swaggerDocs;
