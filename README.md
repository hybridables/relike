# [relike][author-www-url] [![npmjs.com][npmjs-img]][npmjs-url] [![The MIT License][license-img]][license-url] [![npm downloads][downloads-img]][downloads-url] 

> Simple promisify async or sync function with sane defaults. Lower level than `promisify` thing. Can be used to create `promisify` method.

[![code climate][codeclimate-img]][codeclimate-url] [![standard code style][standard-img]][standard-url] [![travis build status][travis-img]][travis-url] [![coverage status][coveralls-img]][coveralls-url] [![dependency status][david-img]][david-url]

You might also be interested in [hybridify][], [hybridify-all][], [relike-all][], [letta][]

## Install
```
npm i relike --save
```

## Usage
> For more use-cases see the [tests](./test.js)

```js
const relike = require('relike')
```

**Note:** It treat functions as asynchronous, based on [is-async-function][].  

Why you should be aware of that? Because if you give async function which don't have last argument called with some of the [common-callback-names][] it will treat that function as synchronous and things may not work as expected.

It's not a problem for most of the cases and for node's native packages, because that's a convention.
So, the [relike-all][] package successfuly can promisifies all of the `fs` functions for example, except `fs.createReadStream` and `fs.createWriteStream` which is normal.

### [relike](index.js#L42)
> Runs `fn` in native Promise if available, or another provided in `relike.Promise`. If not given and not support for native Promise, it will use [bluebird][] promise, but only on that enviroments that don't have support.

**Params**

* `<fn>` **{Function}**: Some async or synchronous function.    
* `[...args]` **{Mixed}**: Any number of any type of arguments, they are passed to `fn`.    
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

### [.promisify](index.js#L110)
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

### .Promise

While `relike` always trying to use native Promise if available in the enviroment, you can
give a Promise constructor to be used on enviroment where there's no support - for example, old
broswers or node's 0.10 version. By default, `relike` will use and include [bluebird][] on old enviroments,
as it is the fastest implementation of Promises. So, you are able to give Promise constructor, but
it won't be used in modern enviroments - it always will use native Promise, you can't trick that. You
can't give custom promise implementation to be used in any enviroment.

**Example**

```js
var fs = require('fs')
var relike = require('relike')

relike.promisify.Promise = require('q') // using `Q` promise on node 0.10
var readFile = relike.promisify(fs.readFile)

readFile('package.json', 'utf8')
  .then(console.log, console.error)
```

One way to pass a custom Promise constructor is as shown above. But the other way is passing it to `.Promise` of the promisified function, like that

```js
var fs = require('fs')
var relike = require('relike')
var statFile = relike.promisify(fs.stat)

statFile.Promise = require('when') // using `when` promise on node 0.10
statFile('package.json').then(console.log, console.error)
```

One more thing, is that you can access the used Promise and can detect what promise is used. It is easy, just as `promise.Promise` and you'll get it.
Or look for `promise.___bluebirdPromise` and `promise.___customPromise` properties. `.___bluebirdPromise` (yea, with three underscores in front) will be true if enviroment is old and you didn't provide promise constructor to `.Promise`.  
So, when you give constructor `.__customPromise` will be true and `.___bluebirdPromise` will be false.

```js
var fs = require('fs')
var relike = require('relike')

var promise = relike(fs.readFile, 'package.json', 'utf8')
promise.then(JSON.parse).then(function (val) {
  console.log(val.name) // => 'relike'
}, console.error)

console.log(promise.Promise) // => used Promise constructor
console.log(promise.___bluebirdPromise) // => `true` on old env, falsey otherwise
console.log(promise.___customPromise) // => `true` when pass `.Promise`, falsey otherwise
```

Or finally, you can pass Promise constructor as second argument to `.promisify` method. Like that

```js
const fs = require('fs')
const relike = require('relike')
const readFile = relike.promisify(fs.readFile, require('when'))

const promise = readFile('index.js')

console.log(promise.Promise) // => The `when` promise constructor, on old enviroments
console.log(promise.___customPromise) // => `true` on old environments
```

## Related
* [callback2stream](https://www.npmjs.com/package/callback2stream): Transform sync, async or generator function to Stream. Correctly handle errors. [homepage](https://github.com/hybridables/callback2stream)
* [hybridify](https://www.npmjs.com/package/hybridify): Create sync or async function to support both promise and callback-style APIs… [more](https://www.npmjs.com/package/hybridify) | [homepage](https://github.com/hybridables/hybridify)
* [letta](https://www.npmjs.com/package/letta): Promisify sync, async or generator function, using [relike][]. Kind of promisify, but… [more](https://www.npmjs.com/package/letta) | [homepage](https://github.com/hybridables/letta)
* [limon](https://www.npmjs.com/package/limon): The pluggable JavaScript lexer. Limon = Lemon. | [homepage](https://github.com/limonjs/limon)
* [promise2stream](https://www.npmjs.com/package/promise2stream): Transform ES2015 Promise to Stream - specifically, Transform Stream using… [more](https://www.npmjs.com/package/promise2stream) | [homepage](https://github.com/hybridables/promise2stream)
* [relike-all](https://www.npmjs.com/package/relike-all): Promisify all functions in an object, using `relike`. | [homepage](https://github.com/hybridables/relike-all)
* [use-ware](https://www.npmjs.com/package/use-ware): Adds sync plugin support to your application. Kinda fork of [use][] -… [more](https://www.npmjs.com/package/use-ware) | [homepage](https://github.com/tunnckocore/use-ware)
* [use](https://www.npmjs.com/package/use): Easily add plugin support to your node.js application. | [homepage](https://github.com/jonschlinkert/use)
* [value2stream](https://www.npmjs.com/package/value2stream): Transform any value to stream. Create a stream from any value -… [more](https://www.npmjs.com/package/value2stream) | [homepage](https://github.com/hybridables/value2stream)

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/hybridables/relike/issues/new).  
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.

## [Charlike Make Reagent](http://j.mp/1stW47C) [![new message to charlike][new-message-img]][new-message-url] [![freenode #charlike][freenode-img]][freenode-url]

[![tunnckoCore.tk][author-www-img]][author-www-url] [![keybase tunnckoCore][keybase-img]][keybase-url] [![tunnckoCore npm][author-npm-img]][author-npm-url] [![tunnckoCore twitter][author-twitter-img]][author-twitter-url] [![tunnckoCore github][author-github-img]][author-github-url]

[hybridify]: https://github.com/hybridables/hybridify
[hybridify-all]: https://github.com/hybridables/hybridify-all
[bluebird]: https://github.com/petkaantonov/bluebird
[common-callback-names]: https://github.com/tunnckocore/common-callback-names
[is-async-function]: https://github.com/tunnckocore/is-async-function
[letta]: https://github.com/hybridables/letta
[relike]: https://github.com/hybridables/relike
[relike-all]: https://github.com/hybridables/relike-all
[through2]: https://github.com/rvagg/through2
[use]: https://github.com/jonschlinkert/use

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