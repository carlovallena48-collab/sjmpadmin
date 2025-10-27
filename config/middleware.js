const express = require("express");
const cors = require("cors");

const configureMiddleware = (app) => {
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
};

module.exports = configureMiddleware;