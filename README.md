# rddx-express
Express.js base project  for REPL drive development

## Installation

For Node v4.0.0 or above:

```bash
$ npm install rddx-express express@4.x --save
```

Notes: `rddx-express` doesn't include `express` module, so you need to install it.

## Usage

main file `app.js`:

```javascript
const path = require('path');
const project = require('rddx-express');
const express = require('express');
const serveStatic = require('serve-static');
const ejs = require('ejs');

project.set('path', __dirname);
project.set('port', 3000);

project.register('router.default', './routes/index.js');
project.register('router.admin', './routes/admin.js');
project.register('init', './init.js');

project.on('reload', file => {
  console.log(`reload file: ${file}`);
});
project.on('init', app => {
  console.log(`inited`);
});

project.listen(err => {
  console.log(`start failed: ${err}`);
});
```

init express file `init.js`:

```javascript
module.exports = function (project) {

  let app = express();
  app.set('views', path.resolve(__dirname, 'views'));
  app.set('view engine', 'html');
  app.engine('html', ejs.__express);
  app.use('/assets', serveStatic(path.resolve(__dirname, 'assets')));
  app.use('/admin', project.router('admin'));
  app.use('/', project.router('default'));
  return app;

};
```

register routes file `routes/index.js`:

```javascript
module.exports = function (project, mod, router) {

  mod.register('home', './home.js');
  mod.register('user', './user.js');

  router.get('/', mod('home').index);
  router.get('/list', mod('home').list);

  router.get('/user', mod('user').index);
  router.get('/signup', mod('user').signup);
  router.get('/login', mod('user').login);
};
```

routes handle file `routes/home.js`:

```javascript
const project = require('rddx-express');

exports.index = function (req, res, next) {
  res.render('index');
};

exports.list = function (req, res, next) {
  res.render('list');
};
```

## License

```
The MIT License (MIT)

Copyright (c) 2015 Zongmin Lei <leizongmin@gmail.com>
http://ucdok.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
