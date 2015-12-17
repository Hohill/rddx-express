'use strict';

const project = require('rddx-express');

exports.index = function (req, res, next) {
  res.render('index');
};

exports.list = function (req, res, next) {
  res.render('list');
};