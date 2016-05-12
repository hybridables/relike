/*!
 * relike <https://github.com/hybridables/relike>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var utils = require('./utils')

/**
 * > Runs `fn` in native Promise if available, or another
 * provided in `relike.Promise`. If not given and not
 * support for native Promise, it will use [bluebird][] promise,
 * but only on that enviroments that don't have support.
 *
 * **Example**
 *
 * ```js
 * const fs = require('fs')
 * const request = require('request')
 * const relike = require('relike')
 *
 * relike(fs.readFile, 'package.json', 'utf-8').then(data => {
 *   console.log(JSON.parse(data).name) // => 'relike'
 * })
 *
 * // handles multiple arguments by default (comes from `request`)
 * relike(request, 'http://www.tunnckocore.tk/').then(result => {
 *   const [httpResponse, body] = result
 * })
 * ```
 *
 * @name   relike
 * @param  {Function} `<fn>` Some async or synchronous function.
 * @return {Promise} Always native Promise if supported on enviroment.
 * @api public
 */

var relike = module.exports = function relike (fn) {
  var Promize = utils.nativeOrAnother(relike.Promise)
  if (typeof fn !== 'function') {
    return Promize.reject(new TypeError('relike: expect `fn` be function'))
  }
  var self = this
  var argz = utils.handleArguments(arguments)
  argz.args = argz.args.slice(1)

  var promise = new Promize(function (resolve, reject) {
    var isAsyncFn = utils.isAsyncFunction(fn)
    if (isAsyncFn) {
      argz.args = argz.args.concat(utils.onetime(utils.dezalgo(function callback (err, res) {
        if (err) return reject(err)
        if (arguments.length > 2) res = utils.sliced(arguments, 1)
        resolve(res)
      })))
    }
    var syncResult = fn.apply(self, argz.args)
    if (!isAsyncFn) {
      resolve(syncResult)
    }
  })

  // inherit from NativeOrAnother
  // to detect what promise is used on enviroment
  // where no support for native Promise
  promise.Promise = Promize
  promise.___customPromise = Promize.___customPromise
  promise.___bluebirdPromise = Promize.___bluebirdPromise

  return promise
}

/**
 * > Thin wrapper function around `relike()`. It **accepts
 * a function** and **returns a function**, which when is
 * invoked returns a `Promise`. Just like any other `.promisify`
 * method, for example `Bluebird.promisify`.
 *
 * **Example**
 *
 * ```js
 * var fs = require('fs')
 * var relike = require('relike')
 * var readFile = relike.promisify(fs.readFile)
 *
 * readFile('package.json', 'utf8')
 *   .then(JSON.parse)
 *   .then(data => {
 *     console.log(data.name) // => 'relike'
 *   })
 *
 * // also can promisify sync function
 * var statFile = relike.promisify(fs.statSync)
 * statFile('package.json')
 *   .then(function (stats) {
 *     console.log(stats.mtime)
 *   })
 * ```
 *
 * @name   .promisify
 * @param  {Function} `fn` Some sync or async function to promisify.
 * @param  {Function} `[Promize]` Promise constructor to be used on enviroment where no support for native.
 * @return {Function} Promisified function, which always return a Promise.
 * @api public
 */

relike.promisify = function relikePromisify (fn, Promize) {
  var self = this
  return function promisified () {
    relike.Promise = Promize || relikePromisify.Promise || promisified.Promise
    return relike.apply(this || self, [fn].concat(utils.sliced(arguments)))
  }
}
