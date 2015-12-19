'use strict';

/**
 * rddx-express
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const path = require('path');
const fs = require('fs');
const http = require('http');
const repl = require('repl');
const Mod = require('rddx-mod');
const utils = require('lei-utils');
const express = require('express');
const debug = require('debug')('rddx-express');


function fixES6Module(m) {
  if (m.__esModule && m.default) {
    return m.default;
  } else {
    return m;
  }
}

function Project() {
  this._setting = {};
  this._mod = null;
  this._express = null;
  this._repl = null;
  this._router = {};
}

utils.inheritsEventEmitter(Project);

/**
 * set option
 *
 * @param {String} name
 * @param {Mixed} val
 * @return {this}
 */
Project.prototype.set = function (name, val) {
  this._setting[name] = val;
  return this;
};

/**
 * get option
 *
 * @param {String} name
 * @return {Mixed}
 */
Project.prototype.get = function (name) {
  return this._setting[name];
};

Project.prototype._createMod = function () {
  return Mod({
    path: this.get('path'),
    reload: this.get('mod reload'),
    delay: this.get('mod delay'),
  });
};

Project.prototype._initMod = function () {
  if (!this._mod) {

    let p = this.get('path');
    if (!p) throw new Error('please setting up `path` before');
    p = path.resolve(p);
    this.set('path', p);

    this._mod = this._createMod();

    let getRouterName = (name) => {
      if (name.indexOf('router.') === 0) {
        return name.slice(7) || null;
      } else {
        return null;
      }
    };

    let registerRouter = (name) => {
      let r = getRouterName(name);
      if (r) {

        let router = express.Router();
        let mod = this._createMod();
        this._router[r] = {router, mod};
        fixES6Module(this._mod(name))(this, mod, router);

        mod.on('reload', (_, file) => {
          debug('reload router: %s', name);
          this._mod.reload(name);
        });

      }
    };

    this._mod.on('register', (name, file) => {
      debug('load file: %s', file);
      this.emit('load', file);
      registerRouter(name);
    });

    this._mod.on('reload', (name, file) => {
      debug('reload file: %s', file);
      this.emit('reload', file);
      registerRouter(name);
    });

  }
};

/**
 * register module
 *
 * @param {String} name
 * @param {String} file
 * @return {this}
 */
Project.prototype.register = function (name, file) {
  this._initMod();
  this._mod.register(name, file);
  return this;
}

/**
 * get router
 *
 * @param {String} name
 * @return {Function}
 */
Project.prototype.router = function (name) {
  if (!this._router[name]) throw new Error(`router "${name}" does not exists`);
  return (req, res, next) => {
    let r = this._router[name];
    if (r && r.router) {
      r.router(req, res, next);
    } else {
      next(new Error(`router "${name}" does not exists`));
    }
  };
};

/**
 * start server and listen port
 *
 * @param {Function} callback
 * @return {this}
 */
Project.prototype.listen = function (callback) {

  // call init module to get an express instance
  let getExpress = () => {
    let init = fixES6Module(this._mod('init'))(this);
    this.emit('init');
    return init;
  };

  this._mod.on('reload', name => {
    if (name === 'init') {
      this._express = getExpress();
    }
  });
  this._express = getExpress();

  // http server
  this._server = http.createServer((req, res) => {
    this._express(req, res);
  });
  this._server.listen(this.get('port'), err => {
    if (err) {
      this.emit('error', err);
    } else {
      this.emit('listen');
    }
    if (callback) callback(err);
  });

  // catch error
  if (this.get('uncaught exception')) {
    process.on('uncaughtException', err => {
      console.error(`uncaughtException: ${err.stack || err}`);
    });
  }

  // start REPL
  if (this.get('repl')) {
    let startREPL = () => {
      this._repl = repl.start('[rddx-express]> ');
      this._repl.context.$project = this;
      this._repl.once('exit', function () {
        console.log('REPL exited');
        process.exit();
      });
    };
    this.once('listen', () => {
      process.nextTick(startREPL);
    });
  }

  return this;
};

const project = new Project();
module.exports = exports = project;
