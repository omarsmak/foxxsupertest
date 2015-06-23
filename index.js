'use strict';



/**
*
* Module dependencies.
*
*/

var console = require("console");
var Agent = require('./app/agent');
var urljoin = require('./lib/url-join');
var _ = require("underscore");


/**
*
* Pass the Foxx Application Context in order to construct the URL
*
*/


module.exports = function(appContext, serverAddress, baseURL) {
	//build the base URL and mounting point
	var name = appContext.name;
	var mountingPoint = appContext.mount;

	if(_.isUndefined(baseURL)){
		baseURL = "";
	}

	//construct full URL
	var fullUrl = urljoin(serverAddress, baseURL, mountingPoint);



	var obj = {};
	obj = new Agent(fullUrl);
	return obj;
};


//module.exports.agent = agent;