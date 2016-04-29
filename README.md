# koa-router-plus

> Create controller and attach related router 

## Thanks To

- [Koa.js](https://github.com/koajs/koa)
- [koa-simple-controller](https://github.com/mrangelmarino/koa-simple-controller/)
- [koa-router](https://github.com/alexmingoia/koa-router)

Idea comes from koa-router and koa-simple-controller

## Installation

Install using [npm](https://www.npmjs.org/):

```sh
npm install koa-router-plus --save
```


## Usage

### index.js

```javascript
'use strict';

var app = require('koa')();
var router = require('koa-router-plus')();

app.use(router.initialCtrl());
app.use(router.routes());
app.listen(3000);
```

### lib/controller/help.js

```javascript
module.exports = {
    index : function(ctx) {
        ctx.body='Hello, What can I do for you?'
    },
    
    serveTea : function(ctx) {
        ctx.body='Tea, please!'
    },

    serveCoffee : function(ctx) {
        ctx.body='Coffee, please!'
    }
}
```

### Browser

URL: http://localhost:3000/help, Means call help.index().

URL: http://localhost:3000/help/serveTea, Means call help.ServTea().

URL: http://localhost:3000/help/serveCoffee, Means call help.ServCoffee().


## Contribute
You are welcome to contribute.

## License
[MIT](LICENSE)
