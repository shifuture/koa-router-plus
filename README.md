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

### lib/controller/index.js

```javascript
module.exports = {
    index : function(ctx) {
        ctx.body='Welcome to drink bar, What kind of drink do you like?'
    },
    
}
```

### lib/controller/help/coffee.js

```javascript
module.exports = {
    index : function(ctx) {
        ctx.body='Hello, What kind of coffee do you like?'
    },
    
    moreSugar: function(ctx) {
        ctx.body='Sugar, please!'
    },

    moreMilk: function(ctx) {
        ctx.body='Milk, please!'
    }
}
```

### lib/controller/help/Tea.js

```javascript
module.exports = {
    index : function(ctx) {
        ctx.body='Hello, What kind of tea do you like?'
    },
    
    hotter: function(ctx) {
        ctx.body='Hey, heat it please!'
    },
}
```

### Browser

URL: http://localhost:3000/, Means call index.index().

URL: http://localhost:3000/help/coffee, Means call help.coffee.index().

URL: http://localhost:3000/help/coffee/moreSugar, Means call help.coffee.moreSugar().

## Contribute
You are welcome to contribute.

## License
[MIT](LICENSE)
