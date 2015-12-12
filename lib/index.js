/**
 * rddx-express
 *
 * @author Zongmin Lei <leizongmin@gmail.com>
 */

const path = require('path');
const fs = require('fs');
const Mod = require('rddx-mod');
const utils = require('lei-utils');

function Project() {
  this._settings = {};
  this._mod = null;
  this._initFn = null;
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
  let initFn = this._mod('init');

};

const project = new Project();
module.exports = exports = project;

