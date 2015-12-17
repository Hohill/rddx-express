'use strict';

const project = require('../../');

exports.index = function (req, res, next) {
  res.render('index');
};

exports.list = function (req, res, next) {
  let list = [];
  for (let i = 0; i < 10; i++) {
    list.push(Math.random());
  }
  res.locals.list = list;
  res.render('list');
};
