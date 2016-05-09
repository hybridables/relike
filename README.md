# [relike][author-www-url] [![npmjs.com][npmjs-img]][npmjs-url] [![The MIT License][license-img]][license-url] [![npm downloads][downloads-img]][downloads-url] 

> Simple promisify async or sync function with sane defaults. Lower level than `promisify` thing. Can be used to create `promisify` method.

[![code climate][codeclimate-img]][codeclimate-url] [![standard code style][standard-img]][standard-url] [![travis build status][travis-img]][travis-url] [![coverage status][coveralls-img]][coveralls-url] [![dependency status][david-img]][david-url]

## Install
```
npm i relike --save
```

## Usage
> For more use-cases see the [tests](./test.js)

```js
const relike = require('relike')
```

### [relike](index.js#L41)
> Runs `fn` in native Promise if available, or another provided in `relike.Promise`. If not given and not support for native Promise, it will use [bluebird][] promise, but only on that enviroments that don't have support.

**Params**

* `<fn>` **{Function}**: Some async or synchronous function.    
* `returns` **{Promise}**: Always native Promise if supported on enviroment.  

**Example**

```js
const fs = require('fs')
const request = require('request')
const relike = require('relike')

relike(fs.readFile, 'package.json', 'utf-8').then(data => {
  console.log(JSON.parse(data).name) // => 'relike'
})

// handles multiple arguments by default (comes from `request`)
relike(request, 'http://www.tunnckocore.tk/').then(result => {
  const [httpResponse, body] = result
})
```

### [.promisify](index.js#L109)
> Thin wrapper function around `relike()`. It **accepts a function** and **returns a function**, which when is invoked returns a `Promise`. Just like any other `.promisify` method, for example `Bluebird.promisify`.

**Params**

* `fn` **{Function}**: Some sync or async function to promisify.    
* `[Promize]` **{Function}**: Promise constructor to be used on enviroment where no support for native.    
* `returns` **{Function}**: Promisified function, which always return a Promise.  

**Example**

```js
var fs = require('fs')
var relike = require('relike')
var readFile = relike.promisify(fs.readFile)

readFile('package.json', 'utf8')
  .then(JSON.parse)
  .then(data => {
    console.log(data.name) // => 'relike'
  })

// also can promisify sync function
var statFile = relike.promisify(fs.statSync)
statFile('package.json')
  .then(function (stats) {
    console.log(stats.mtime)
  })
```

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/hybridables/relike/issues/new).  
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.

## [Charlike Make Reagent](http://j.mp/1stW47C) [![new message to charlike][new-message-img]][new-message-url] [![freenode #charlike][freenode-img]][freenode-url]

[![tunnckoCore.tk][author-www-img]][author-www-url] [![keybase tunnckoCore][keybase-img]][keybase-url] [![tunnckoCore npm][author-npm-img]][author-npm-url] [![tunnckoCore twitter][author-twitter-img]][author-twitter-url] [![tunnckoCore github][author-github-img]][author-github-url]

[bluebird]: https://github.com/petkaantonov/bluebird

[npmjs-url]: https://www.npmjs.com/package/relike
[npmjs-img]: https://img.shields.io/npm/v/relike.svg?label=relike

[license-url]: https://github.com/hybridables/relike/blob/master/LICENSE
[license-img]: https://img.shields.io/npm/l/relike.svg

[downloads-url]: https://www.npmjs.com/package/relike
[downloads-img]: https://img.shields.io/npm/dm/relike.svg

[codeclimate-url]: https://codeclimate.com/github/hybridables/relike
[codeclimate-img]: https://img.shields.io/codeclimate/github/hybridables/relike.svg

[travis-url]: https://travis-ci.org/hybridables/relike
[travis-img]: https://img.shields.io/travis/hybridables/relike/master.svg

[coveralls-url]: https://coveralls.io/r/hybridables/relike
[coveralls-img]: https://img.shields.io/coveralls/hybridables/relike.svg

[david-url]: https://david-dm.org/hybridables/relike
[david-img]: https://img.shields.io/david/hybridables/relike.svg

[standard-url]: https://github.com/feross/standard
[standard-img]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

[author-www-url]: http://www.tunnckocore.tk
[author-www-img]: https://img.shields.io/badge/www-tunnckocore.tk-fe7d37.svg

[keybase-url]: https://keybase.io/tunnckocore
[keybase-img]: https://img.shields.io/badge/keybase-tunnckocore-8a7967.svg

[author-npm-url]: https://www.npmjs.com/~tunnckocore
[author-npm-img]: https://img.shields.io/badge/npm-~tunnckocore-cb3837.svg

[author-twitter-url]: https://twitter.com/tunnckoCore
[author-twitter-img]: https://img.shields.io/badge/twitter-@tunnckoCore-55acee.svg

[author-github-url]: https://github.com/tunnckoCore
[author-github-img]: https://img.shields.io/badge/github-@tunnckoCore-4183c4.svg

[freenode-url]: http://webchat.freenode.net/?channels=charlike
[freenode-img]: https://img.shields.io/badge/freenode-%23charlike-5654a4.svg

[new-message-url]: https://github.com/tunnckoCore/ama
[new-message-img]: https://img.shields.io/badge/ask%20me-anything-green.svg