'use strict';

const project = require('../../');

exports.list = function (req, res, next) {
  let list = [];
  for (let i = 0; i < 10; i++) {
    list.push(Date.now() + ':' + Math.random());
  }
  res.locals.list = list;
  res.render('list');
};
