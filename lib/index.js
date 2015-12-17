'use strict';

/**
 * rddx-express
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const path = require('path');
const fs = require('fs');
const http = require('http');
const Mod = require('rddx-mod');
const utils = require('lei-utils');
const express = require('express');
const debug = require('debug')('rddx-express');

function Project() {
  this._setting = {};
  this._mod = null;
  this._express = null;
  this._router = {};
}

utils.inheritsEventEmitter(Project);


Project.prototype.set = function (name, val) {
  this._setting[name] = val;
};

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
        this._mod(name)(this, mod, router);
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

Project.prototype.register = function (name, file) {
  this._initMod();
  this._mod.register(name, file);
}

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

Project.prototype.listen = function (callback) {

  let getExpress = () => {
    let init = this._mod('init')(this);
    this.emit('init');
    return init;
  };

  this._mod.on('reload', name => {
    if (name === 'init') {
      this._express = getExpress();
    }
  });
  this._express = getExpress();

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

  if (this.get('uncaught exception')) {
    process.on('uncaughtException', err => {
      console.error(`uncaughtException: ${err.stack || err}`);
    });
  }

};

const project = new Project();
module.exports = exports = project;

