'use strict';



/**
*
* Module dependencies.
*
*/
var Test = require('./Test');
var urljoin = require('./../lib/url-join');
var console = require("console");
var methods = require('./../lib/methods')

//var request = require("request");


var Agent = function(url) {
	this.url = url;
}



// override HTTP verb methods

methods.forEach(function(method){
  Agent.prototype[method] = function(restPoint, options){
    var res = new Test(method, urljoin(this.url, restPoint), options);
    return res;
  };
});

/*
Agent.prototype.get = function(restPoint, options) {
	var res = new Test("GET", urljoin(this.url, restPoint), options);
	return res;
}*/

module.exports = Agent;