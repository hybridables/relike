/*!
 * relike <https://github.com/hybridables/relike>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var utils = require('./utils')

/**
 * Will try to promisify `fn` with native Promise,
 * otherwise will use `Bluebird` or you can give
 * different promise module to `relike.promise`, for example `pinkie`.
 *
 * **Example**
 *
 * ```js
 * const fs = require('fs')
 * const request = require('request')
 * const relike = require('relike')
 *
 * relike(fs.readFile, 'package.json', 'utf-8').then(data => {
 *   console.log(JSON.parse(data).name)
 * })
 *
 * // handles multiple arguments by default (comes from `request`)
 * relike(request, 'http://www.tunnckocore.tk/').then(result => {
 *   const [httpResponse, body] = result
 * })
 * ```
 *
 * @name   relike
 * @param  {Function} `<fn>` callback-style or synchronous function to promisify
 * @return {Promise} promise
 * @api public
 */
var relike = module.exports = function relike (fn) {
  var Prome = utils.nativeOrAnother(relike.promise)
  if (typeof fn !== 'function') {
    return Prome.reject(new TypeError('relike expect a function'))
  }
  var argz = utils.handleArguments(arguments)
  var self = this
  argz.args = argz.args.slice(1)

  if (argz.callback && !utils.isAsyncFunction(argz.callback)) {
    argz.args = argz.args.concat(argz.callback)
  }

  var promise = new Prome(function prome (resolve, reject) {
    var isAsync = utils.isAsyncFunction(fn)
    if (isAsync) {
      argz.args = argz.args.concat(function cb (err, res) {
        if (err) return reject(err)
        if (arguments.length > 2) res = utils.sliced(arguments, 1)
        resolve(res)
      })
    }
    var syncResult = fn.apply(self, argz.args)
    if (!isAsync) {
      resolve(syncResult)
    }
  })

  promise.Prome = Prome
  promise.___customPromise = Prome.___customPromise
  promise.___bluebirdPromise = Prome.___bluebirdPromise
  return promise
}

/**
 * Wraps a function and returns a function that when is
 * invoked returns Promise. Same as `Bluebird.promisify`.
 *
 * **Example**
 *
 * ```js
 * const fs = require('fs')
 * const relike = require('relike')
 * const readFile = relike.promisify(fs.readFile)
 *
 * readFile('package.json', 'utf8')
 *   .then(JSON.parse)
 *   .then(data => {
 *     console.log(data.name) // => 'relike'
 *   })
 * ```
 *
 * @name   .promisify
 * @param  {Function} `[fn]` function to promisify
 * @param  {Function} `[Prome]` custom Promise constructor/module to use, e.g. `Q`
 * @return {Function} promisified function
 * @api public
 */
module.exports.promisify = function relikePromisify (fn, Prome) {
  var self = this
  return function promisified () {
    var ctx = self || this
    var args = utils.sliced(arguments)
    relike.promise = Prome || relikePromisify.promise || promisified.promise
    return relike.apply(ctx, [fn].concat(args))
  }
}
