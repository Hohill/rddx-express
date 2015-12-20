# rddx-express
Express.js base project for REPL drive development

## Installation

**Only for Node v4.0.0 or above**:

```bash
$ npm install rddx-express express@4.x --save
```

**Notes: `rddx-express` doesn't include `express` module, please install it first.**

## Usage

### Example files

Launch file `app.js`:

```javascript
'use strict';

const path = require('path');
const project = require('rddx-express');

// required options
project.set('path', __dirname);
project.set('port', 3000);

// development mode options
project.set('mod reload', true);         // enable hot reload
project.set('uncaught exception', true); // catch `uncaughtException` event
project.set('repl', true);               // start a REPL

// register module
project.register('init', './init.js');
project.register('router.default', './routes/index.js');
project.register('router.admin', './routes/admin.js');

// events
project.on('reload', file => {
  console.log(`reload file: ${file}`);
});
project.on('init', app => {
  console.log(`inited`);
});

// start listening
project.listen(err => {
  console.log(`start failed: ${err}`);
});
```

Initialize express file `init.js` **(support hot reload)**:

```javascript
'use strict';
const path = require('path');
const express = require('express');
const serveStatic = require('serve-static');
const ejs = require('ejs');

module.exports = function (project) {

  let app = express();

  app.set('views', path.resolve(__dirname, 'views'));
  app.set('view engine', 'html');
  app.engine('html', ejs.__express);
  app.use('/assets', serveStatic(path.resolve(__dirname, 'assets')));
  app.use('/admin', project.router('admin'));

  // register router
  app.use('/', project.router('default'));
  // notes: don't use such `app.get()` method to register router

  // return an express instance
  return app;

};
```

Notes: if you are using **babel**, you can use `export default xx` instead of `module.exports = xx`, for example:

```javascript
export default function (project) {
  // your code here...
}
```

Register routes file `routes/index.js` **(support hot reload)**:

```javascript
'use strict';

module.exports = function (project, mod, router) {

  // register hot reload module
  mod.register('home', './home.js');
  mod.register('user', './user.js');

  router.get('/', mod('home').index);
  router.get('/list', mod('home').list);

  router.get('/user', mod('user').index);
  router.get('/signup', mod('user').signup);
  router.get('/login', mod('user').login);

};
```

Routes handle file `routes/home.js` **(support hot reload)**:

```javascript
'use strict';

const project = require('rddx-express');

exports.index = function (req, res, next) {
  res.render('index');
};

exports.list = function (req, res, next) {
  res.render('list');
};
```

### Development

Run `app.js` to get start:

```bash
$ node app.js
```

Notes: when the **(support hot reload)** file has been changed, and option `mod reload` is set to `true`, the file will be automatically reloaded.

Generally, the file `init.js` does not support hot reload. If you want to make some changes, for example, to register a new router.

First step, create a new file `routes/admin.js` (like above file `routes/index.js`);

Next, just type your code in REPL:

```javascript
[rddx-express]> project.register('router.admin', './routes/admin.js');
```

Notes: in REPL, you can use variable name `$project` to access to the project instance.

### Production deploy

Delete the below lines in file `app.js`:

```javascript
// development mod
project.set('mod reload', true);         // enable hot reload
project.set('uncaught exception', true); // catch `uncaughtException` event
project.set('repl', true);               // start a REPL
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
