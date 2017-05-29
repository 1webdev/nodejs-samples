'use strict';

var debug = require('debug')('b2t-rest-client'),
    chalk = require('chalk');

var BPromise = require('bluebird'),
    jsonPatch = require('fast-json-patch'),
    request = require('superagent-bluebird-promise');

var extend = require('./lib/extend'),
    Emitter = require('./lib/emitter');

function ApiRequest(url, options) {
    debug('new api request: ' + chalk.cyan('%s'), url);
    Emitter.call(this);

    this.url = url;
    this.options = (typeof(options) === 'object') ? options : {};

    this.parent = this.options.apiClient;

    this.ids = [];
    this.lastVerb = 'get';
    this.request = undefined;

    if (options) {
        this.postfix = options.postfix;
        this.id(options.id || options._id);
    }

    this.defaults = (options && options.defaults) || {};

    this.get();

    this.on('before-exec', function() {
        if (!this.defaults)
            return;
        // else:

        var q = {};

        // Add query params to query var, q
        for (var key in this.defaults)
            if (!this.request.qs ||
                this.request.qs[key] === undefined)
                q[key] = this.defaults[key];

        this.request.query(q);
    }.bind(this));
}

extend(ApiRequest, Emitter);
module.exports = ApiRequest;



// Alias important methods from our superagent request
//

// Create methods for each request type
['get', 'put','post','patch','delete'].forEach(function(verb) {
    ApiRequest.prototype[verb] =
    function() {
        this.lastVerb = verb;

        var url = this.url;

        // Add id to url
        if (this.ids && this.ids.length && typeof(this.ids[0])!='undefined'){
            url += '/' + this.ids.join('/');
        }

        // Add postfix to url
        if (this.postfix)
            url += (!/^\//.test(this.postfix) ? '/' : '') + this.postfix;

        debug('request ['+chalk.yellow('%s')+'] => ' + chalk.cyan('%s'), verb, url);

        if (!this.request) {
            this.request = request[verb](url);
        } else {
            this.request.url = url;
            this.request.method = verb.toUpperCase();
        }

        this.fire('url-set', url);
        return this;
    };
});

ApiRequest.prototype.query =
function() {
    this.request = this.request.query.apply(this.request, arguments);
    return this;
};

ApiRequest.prototype.exec =
ApiRequest.prototype.end =
BPromise.method(function() {
    this.fire('before-exec');
    if (this.parent) this.parent.fire('child.before-exec');
    var apiRequest = this;
    return this.request
               .then(function(response) {
                    return [response.body,response];
               }, function(err) {
                   if (apiRequest.parent) apiRequest.parent.fire('child.exec-error', err);

                   if (!apiRequest.hasEvent('exec-error'))
                       throw err; // re-throw the error, there are no handlers

                   apiRequest.fire('exec-error', err);
               });
});

ApiRequest.prototype.then =
BPromise.method(function(func) {
    return this.end()
               .then(func);
});

ApiRequest.prototype.spread =
BPromise.method(function(func) {
    return this.end()
               .spread(func);
});

ApiRequest.prototype.promise =
BPromise.method(function() {
    this.fire('before-exec');
    return this.request.promise.apply(this.request, arguments);
});

ApiRequest.prototype.send =
function() {
    this.request = this.request.send.apply(this.request, arguments);
    return this;
};

/**
 * Generate a json-patch and set it as the send value
 */
ApiRequest.prototype.sendPatch =
function(newVal, oldVal) {
    var diff = jsonPatch.compare(oldVal, newVal);
    this.request = this.request.send(diff);
    return this;
};



ApiRequest.prototype.id =
ApiRequest.prototype.setId =
function(id, index) {
    index = index || 0;

    this.ids[index] = id;
    return this[this.lastVerb]();
};

/**
 * Set the postfix or reset it
 */
ApiRequest.prototype.base =
ApiRequest.prototype.method =
ApiRequest.prototype.action =
ApiRequest.prototype.setPostfix =
function(postfix) {
    this.postfix = postfix || null;
    return this[this.lastVerb]();
};

ApiRequest.prototype.set =
function() {
    this.request = this.request.set.apply(this.request, arguments);
    return this;
};

ApiRequest.prototype.authenticate =
ApiRequest.prototype.token =
function(token) {
    return this.set('x-access-token', token);
};

ApiRequest.prototype.media =
function(field) {
    return this.setPostfix('media' + ((field) ? '/' + field : ''));
};

ApiRequest.prototype.searchQuery =
function() {
    return this.setPostfix('query')
               .post();
};



// Create methods for each of the different types of
// query params that are allowed by the rest api
//

ApiRequest.prototype.envelope =
function(val) {
    this.request = this.request.query({ envelope: arguments.length ? val : true });
    return this;
};

ApiRequest.prototype.page =
function(num) {
    this.request = this.request.query({ page: num });
    return this;
};

ApiRequest.prototype.limit =
function(num) {
    this.request = this.request.query({ limit: num });
    return this;
};

ApiRequest.prototype.include =
ApiRequest.prototype.includes =
function(val) {
    if (Array.isArray(val)) val = val.join(',');
    this.request = this.request.query({ include: val });
    return this;
};

ApiRequest.prototype.includeFlags =
ApiRequest.prototype.flags =
ApiRequest.prototype.flag =
function(val) {
    this.request = this.request.query({ includeFlags: arguments.length ? val : true });
    return this;
};

ApiRequest.prototype.projectId =
ApiRequest.prototype.project =
function(val) {
    if (val && val._id)
        val = val._id;
    this.request = this.request.query({ project: val });
    return this;
};

ApiRequest.prototype.full =
function(val) {
    this.request = this.request.query({ full: arguments.length ? val : true });
    return this;
};

ApiRequest.prototype.search =
ApiRequest.prototype.q =
function(val) {
    this.request = this.request.query({ q: val });
    return this;
};

ApiRequest.prototype.location =
ApiRequest.prototype.loc =
function(val) {
    if (Array.isArray(val)) val = val.join(',');
    this.request = this.request.query({ loc: val });
    return this;
};

ApiRequest.prototype.distance =
ApiRequest.prototype.dist =
function(num) {
    this.request = this.request.query({ dist: num });
    return this;
};

ApiRequest.prototype.sort =
function(val) {
    if (Array.isArray(val)) val = val.join(',');
    this.request = this.request.query({ sort: val });
    return this;
};

ApiRequest.prototype.related =
function(val) {
    if (Array.isArray(val)) val = val.join(',');
    this.request = this.request.query({ related: val });
    return this;
};

ApiRequest.prototype.terms =
ApiRequest.prototype.searchTerms =
function(val) {
    if (Array.isArray(val)) val = val.join(',');
    this.request = this.request.query({ searchTerms: val });
    return this;
};

ApiRequest.prototype.select =
function(val) {
    if (Array.isArray(val)) val = val.join(',');
    this.request = this.request.query({ select: val });
    return this;
};

ApiRequest.prototype.detach =
function(val) {
    this.request = this.request.query({ detach: arguments.length ? val : true });
    return this;
};

ApiRequest.prototype.count =
function(val) {
    this.request = this.request.query({ count: arguments.length ? val : true });
    return this;
};

ApiRequest.prototype.ignoreDefaults =
function(val) {
    if (!this.options) this.options = {};
    this.options.ignoreDefaults = (!!val);
    return this;
};

ApiRequest.prototype.ignoreAuth =
function(val) {
    if (!this.options) this.options = {};
    this.options.ignoreAuth = (!!val);
    return this;
};

ApiRequest.prototype.ignoreProject =
function(val) {
    if (!this.options) this.options = {};
    this.options.ignoreProject = (!!val);
    return this;
};




