'use strict';

module.exports = function (project, mod, router) {

  mod.register('home', './routes/home.js');
  mod.register('home2', './routes/home2.js');

  router.get('/', mod('home').index);
  router.get('/l', mod('home').list);

  router.get('/l2', mod('home2').list);

};
