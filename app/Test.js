'use strict';


/**
 *
 * Module dependencies
 *
 */
var request = require('org/arangodb/request');
var util = require("util");
var assert = require("assert");
var console = require("console");
var http = require('./../lib/http');

/**
 *
 * Tesing functions
 *
 */



function Test(method, restUrl, options) {
    this.url = restUrl;
    this.options = options;
    this._fields = {};
    this._bodies = [];
    this._asserts = [];
    this._method = method;
    //return this;
}



/**
 * Expectations:
 *
 *   .expect(200)
 *   .expect(200, fn)
 *   .expect(200, body)
 *   .expect('Some body')
 *   .expect('Some body', fn)
 *   .expect('Content-Type', 'application/json')
 *   .expect('Content-Type', 'application/json', fn)
 *   .expect(fn)
 *
 * @return {Test}
 * @api public
 */

Test.prototype.expect = function(a, b, c) {

    var self = this;

    // callback
    if ('function' == typeof a) {
        this._asserts.push(a);
        return this;
    }
    if ('function' == typeof b) this.end(b);
    if ('function' == typeof c) this.end(c);

    // status
    if ('number' == typeof a) {
        this._status = a;
        // body
        if ('function' != typeof b && arguments.length > 1) this._bodies.push(b);
        return this;
    }

    // header field
    if ('string' == typeof b || 'number' == typeof b || b instanceof RegExp) {
        if (!this._fields[a]) this._fields[a] = [];
        this._fields[a].push(b);
        return this;
    }

    // body
    this._bodies.push(a);

    return this;
};



/**
 *
 * End request and return the res
 *
 */

Test.prototype.end = function(fn) {
    var self = this;
    //self.assert(fn);

    var res = request[this._method](this.url, this.options);

    //console.log(res);

    self.assert(res, fn);

    return this;
};


Test.prototype.assert = function(res, fn) {
    var status = this._status,
        fields = this._fields,
        bodies = this._bodies,
        expecteds, actual, re;

    // body
    for (var i = 0; i < bodies.length; i++) {
        var body = bodies[i];
        var isregexp = body instanceof RegExp;
        // parsed
        if ('object' == typeof body && !isregexp) {
            try {
                assert.deepEqual(body, res.body);
            } catch (err) {
                var a = util.inspect(body);
                var b = util.inspect(res.body);
                return fn(error('expected ' + a + ' response body, got ' + b, body, res.body), res);
            }
        } else {
            // string
            if (body !== res.text) {
                var a = util.inspect(body);
                var b = util.inspect(res.text);

                // regexp
                if (isregexp) {
                    if (!body.test(res.text)) {
                        return fn(error('expected body ' + b + ' to match ' + body, body, res.body), res);
                    }
                } else {
                    return fn(error('expected ' + a + ' response body, got ' + b, body, res.body), res);
                }
            }
        }
    }

    // fields
    for (var field in fields) {
        expecteds = fields[field];
        actual = res.headers[field.toLowerCase()];
        if (null == actual) return fn(error('expected "' + field + '" header field'), res);
        for (var i = 0; i < expecteds.length; i++) {
            var fieldExpected = expecteds[i];
            if (fieldExpected == actual) continue;
            if (fieldExpected instanceof RegExp) re = fieldExpected;
            if (re && re.test(actual)) continue;
            if (re) return fn(error('expected "' + field + '" matching ' + fieldExpected + ', got "' + actual + '"'), res);
            return fn(error('expected "' + field + '" of "' + fieldExpected + '", got "' + actual + '"'), res);
        }
    }

    // status
    if (status) {
        if (res.status !== status) {
            var a = http.STATUS_CODES[status];
            var b = http.STATUS_CODES[res.status];
            return fn(error('expected ' + status + ' "' + a + '", got ' + res.status + ' "' + b + '"', status, res.status), res);
            //return fn(res);
        }
    }

    // asserts
    for (var i = 0; i < this._asserts.length; i++) {
        var check = this._asserts[i];
        var err;
        try {
            err = check(res);
        } catch (e) {
            err = e;
        }
        if (!(err instanceof Error)) continue;
        return fn(err instanceof Error ? err : new Error(err), res)
    }

    //No error
    //fn.call(null, res);
    return fn(null, res);
};

/**
 * Return an `Error` with `msg` and results properties.
 *
 * @param {String} msg
 * @param {Mixed} expected
 * @param {Mixed} actual
 * @return {Error}
 * @api private
 */

function error(msg, expected, actual) {
    var err = new Error(msg);
    err.msg = msg;
    err.expected = expected;
    err.actual = actual;
    err.showDiff = true;
    return err;
}


module.exports = Test;