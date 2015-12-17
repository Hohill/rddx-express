'use strict';

const path = require('path');
const project = require('../');
const serveStatic = require('serve-static');
const ejs = require('ejs');

project.on('init', app => {
  console.log(`inited`);
});

project.set('path', __dirname);
project.set('port', 3002);
project.set('mod reload', true);
project.set('uncaught exception', true);

project.register('init', './init.js');
project.register('router.default', './routes/index.js');

project.listen(err => {
  if (err) {
    console.log(`start failed: ${err}`);
  } else {
    console.log(`server started`);
  }
});
