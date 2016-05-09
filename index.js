/*!
 * relike <https://github.com/hybridables/relike>
 *
 * Copyright (c) 2016 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var utils = require('./utils')

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

relike.promisify = function relikePromisify (fn, Promize) {
  var self = this
  return function promisified () {
    Promize = Promize || relikePromisify.Promise || promisified.Promise
    return relike.apply(this || self, [fn].concat(utils.sliced(arguments)))
  }
}
