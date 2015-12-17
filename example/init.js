'use strict';

const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
const ejs = require('ejs');

module.exports = function (project) {

  let app = express();

  app.set('views', path.resolve(__dirname, 'views'));
  app.set('view engine', 'html');
  app.engine('html', ejs.__express);
  app.use('/assets', serveStatic(path.resolve(__dirname, 'assets')));
  app.use('/', project.router('default'));

  return app;

};