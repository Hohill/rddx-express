'use strict';

module.exports = function (project, mod, router) {

  mod.register('home', './routes/home.js');

  router.get('/', mod('home').index);

};
