/*!
 * relike <https://github.com/hybridables/relike>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var fs = require('fs')
var test = require('mukla')
var isArray = require('isarray')
var isBuffer = require('is-buffer')
var semver = require('semver')
var relike = require('./index')

function create () {
  return require('./index') // eslint-disable-line
}

function noop () {}

function notSkipOne (one, two, cb) {
  cb(null, one, two, noop)
}

function notSkipTwo (one, two, cb) {
  cb(null, one, two, fs.readFileSync)
}

function multipleArgs (one, two, three, cb) {
  cb(null, one, two, three)
}

test('should .catch TypeError if not function given', function () {
  return relike(123).catch(function (err) {
    test.strictEqual(err.name, 'TypeError')
    test.ok(/expect `fn` be function/.test(err.message))
  })
})

test('should promisify with native Promise or Bluebird', function () {
  var promise = relike(fs.readFile, './package.json', 'utf-8')

  return promise.then(function (res) {
    test.ok(res.indexOf('"license": "MIT"') !== -1)
    if (semver.lt(process.version, '0.11.13')) {
      test.ok(promise.Promise.___bluebirdPromise === true)
      test.ok(promise.___bluebirdPromise, true)
    }
  })
})

test('should flatten multiple arguments to array by default', function () {
  return relike(multipleArgs, 11, 22, 33).then(function (res) {
    test.strictEqual(isArray(res), true)
    test.deepEqual(res, [11, 22, 33])
  })
})

test('should skip last argument only if it is `fn(foo, bar, cb)` (async fn)', function () {
  return relike(notSkipOne, 111, 222).then(function (res) {
    test.strictEqual(isArray(res), true)
    test.deepEqual(res, [111, 222, noop])
  })
})

test('should not skip last argument and work core api (fs.readFileSync)', function () {
  return relike(notSkipTwo, 333, 5555).then(function (res) {
    test.strictEqual(isArray(res), true)
    test.deepEqual(res, [333, 5555, fs.readFileSync])
  })
})

test('should not skip if pass callback fn, e.g. fn(err, res) as last argument', function () {
  function foo (_err, res) {}
  return relike(function (one, fn, cb) {
    cb(null, one, fn)
  }, 123, foo).then(function (res) {
    test.strictEqual(isArray(res), true)
    test.deepEqual(res, [123, foo])
  })
})

test('should promisify sync function `fs.readFileSync` and handle utf8 result', function () {
  var promise = relike(fs.readFileSync, 'package.json', 'utf8')

  return promise
    .then(JSON.parse)
    .then(function (res) {
      test.strictEqual(res.name, 'relike')
    })
})

test('should promisify `fs.readFileSync` and handle buffer result', function () {
  return relike(fs.readFileSync, 'package.json').then(function (buf) {
    test.strictEqual(isBuffer(buf), true)
  })
})

test('should catch errors from failing sync function', function () {
  var promise = relike(fs.readFileSync, 'foobar.json', 'utf8')

  return promise.catch(function (err) {
    test.strictEqual(err.code, 'ENOENT')
    test.strictEqual(/no such file or directory/.test(err.message), true)
  })
})

test('should mute all errors and `.catch` them (should not crash)', function (done) {
  return relike(function () {
    foobar // eslint-disable-line
    /* istanbul ignore next */
    return 123
  }).catch(function (err) {
    test.ifError(!err)
    test.ok(err instanceof Error)
    test.equal(err.name, 'ReferenceError')
  })
})

test('should `.promisify` method wrap a function and return a function', function () {
  var readFile = relike.promisify(fs.readFile)

  return readFile('package.json', 'utf8')
    .then(JSON.parse)
    .then(function (data) {
      test.strictEqual(data.name, 'relike')
    })
})

test('should emit `unhandledRejection` event', function (done) {
  relike(JSON.parse, '{boo:"bar}')
  process.once('unhandledRejection', function (err) {
    test.ifError(!err)
    test.strictEqual(err.name, 'SyntaxError')
    test.ok(/Unexpected token/.test(err.message))
    done()
  })
})

test('should `.promisify` method allow passing `.Promise` to promisified function', function () {
  var relike = create()
  var readFile = relike.promisify(fs.readFile)
  readFile.Promise = require('pinkie') // eslint-disable-line
  var promise = readFile('package.json', 'utf8')

  return promise
    .then(function (res) {
      test.strictEqual(typeof res, 'string')
      test.strictEqual(isBuffer(res), false)
      if (semver.lt(process.version, '0.11.13')) {
        test.strictEqual(promise.___customPromise, true)
        test.strictEqual(promise.Promise.___customPromise, true)
      }
    })
})

test('should use promise passed to `relike.promisify.Promise` and promisifing with `.promisify`', function () {
  var relike = create()
  relike.promisify.Promise = require('pinkie') // eslint-disable-line
  var statFile = relike.promisify(fs.stat)
  var promise = statFile('index.js')

  return promise.then(function (res) {
    if (semver.lt(process.version, '0.11.13')) {
      test.ok(promise.___customPromise === true)
    }
    test.strictEqual(typeof res, 'object')
    test.ok(res.mtime)
  })
})

test('should not use custom promise constructor passed to `relike.Promise` when use `.promisify`', function () {
  var relike = create()
  relike.Promise = require('pinkie') // eslint-disable-line
  var readSync = relike.promisify(fs.readFileSync)
  var promise = readSync('README.md', 'utf8')

  return promise.then(function resolve (result) {
    test.ok(typeof result === 'string')
    if (semver.lt(process.version, '0.11.13')) {
      test.strictEqual(promise.___customPromise, true)
    }
  })
})

test('should promisify with promise module (pinkie) given in `relike.Promise`', function () {
  var relike = create()
  relike.Promise = require('pinkie') // eslint-disable-line
  var promise = relike(fs.readFile, 'package.json')

  return promise.then(function (res) {
    test.strictEqual(isBuffer(res), true)
    if (semver.lt(process.version, '0.11.13')) {
      test.ok(promise.Promise.___customPromise === true)
      test.strictEqual(promise.___customPromise === true, true)
    }
  })
})
