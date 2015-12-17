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
const debug = require('debug')('rddx-express');

function Project() {
  this._settings = {};
  this._mod = null;
  this._express = null;
}

utils.inheritsEventEmitter(Project);


Project.prototype.set = function (name, val) {
  this._settings[name] = val;
};

Project.prototype.get = function (name) {
  return this._settings[name];
};

Project.prototype._initMod = function () {
  if (!this._mod) {

    let p = this.get('path');
    if (!p) throw new Error('please setting up `path` before');
    p = path.resolve(p);
    this.set('path', p);

    this._mod = Mod({
      path: p,
      reload: this.get('mod reload'),
      delay: this.get('mod delay'),
    });

    this._mod.on('register', (name, file) => {
      debug('load file: %s', file);
      this.emit('load', file);
    });
    this._mod.on('reload', (name, file) => {
      debug('reload file: %s', file);
      this.emit('reload', file);
    });

  }
};

Project.prototype.register = function (name, file) {
  this._initMod();
  this._mod.register(name, file);
}

Project.prototype.router = function (name) {
  return this._mod('router.' + name);
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

};

const project = new Project();
module.exports = exports = project;

