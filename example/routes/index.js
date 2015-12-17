'use strict';

module.exports = function (project, mod, router) {

  mod.register('home', './home.js');

  router.get('/', mod('home').index);
  router.get('/list', mod('home').list);

};
