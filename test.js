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

test('should .catch TypeError if not function given', function (done) {
  relike(123).catch(function (err) {
    test.strictEqual(err.name, 'TypeError')
    test.ok(/relike expect a function/.test(err.message))
    done()
  })
})

test('should promisify with native Promise or Bluebird', function (done) {
  var promise = relike(fs.readFile, './package.json', 'utf-8')

  promise.then(function (res) {
    test.ok(res.indexOf('"license": "MIT"') !== -1)
    if (semver.lt(process.version, '0.11.13')) {
      test.ok(promise.Promise.___bluebirdPromise === true)
      test.ok(promise.___bluebirdPromise, true)
    }
    done()
  }, done)
})

test('should promisify with promise module (pinkie) given in `relike.Promise`', function (done) {
  relike.Promise = require('pinkie') // eslint-disable-line
  var promise = relike(fs.readFile, 'package.json')

  promise.then(function (res) {
    test.strictEqual(isBuffer(res), true)
    if (semver.lt(process.version, '0.11.13')) {
      test.strictEqual(promise.___customPromise, true)
      test.strictEqual(promise.Promise.___customPromise, true)
    }
    done()
  }, done)
})

test('should flatten multiple arguments to array by default', function (done) {
  relike(multipleArgs, 11, 22, 33).then(function (res) {
    test.strictEqual(isArray(res), true)
    test.deepEqual(res, [11, 22, 33])
    done()
  }, done)
})

test('should skip last argument only if it is `fn(foo, bar, cb)` (async fn)', function (done) {
  relike(notSkipOne, 111, 222).then(function (res) {
    test.strictEqual(isArray(res), true)
    test.deepEqual(res, [111, 222, noop])
    done()
  }, done)
})

test('should not skip last argument and work core api (fs.readFileSync)', function (done) {
  relike(notSkipTwo, 333, 5555).then(function (res) {
    test.strictEqual(isArray(res), true)
    test.deepEqual(res, [333, 5555, fs.readFileSync])
    done()
  }, done)
})

test('should not skip if pass callback fn, e.g. fn(err, res) as last argument', function (done) {
  function foo (_err, res) {}
  relike(function (one, fn, cb) {
    cb(null, one, fn)
  }, 123, foo).then(function (res) {
    test.strictEqual(isArray(res), true)
    test.deepEqual(res, [123, foo])
    done()
  }, done)
})

test('should promisify sync function `fs.readFileSync` and handle utf8 result', function (done) {
  var promise = relike(fs.readFileSync, 'package.json', 'utf8')

  promise
    .then(JSON.parse, done)
    .then(function (res) {
      test.strictEqual(res.name, 'relike')
      done()
    }, done)
})

test('should promisify `fs.readFileSync` and handle buffer result', function (done) {
  relike(fs.readFileSync, 'package.json').then(function (buf) {
    test.strictEqual(isBuffer(buf), true)
    done()
  }, done)
})

test('should catch errors from failing sync function', function (done) {
  var promise = relike(fs.readFileSync, 'foobar.json', 'utf8')

  promise.catch(function (err) {
    test.strictEqual(err.code, 'ENOENT')
    test.strictEqual(/no such file or directory/.test(err.message), true)
    done()
  })
})

test('should `.promisify` method wrap a function and return a function', function (done) {
  var readFile = relike.promisify(fs.readFile)

  readFile('package.json', 'utf8')
    .then(JSON.parse, done)
    .then(function (data) {
      test.strictEqual(data.name, 'relike')
      done()
    }, done)
})
