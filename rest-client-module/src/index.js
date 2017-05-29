'use strict';

require('./lib/ends-with');
var debug = require('debug')('b2t-rest-client'),
    chalk = require('chalk');

var BPromise = require('bluebird'),
    request = require('superagent-bluebird-promise'),
    userHelpers = require('b2t-common/helpers/user');

var ApiRequest = require('./request');

var extend = require('./lib/extend'),
    Emitter = require('./lib/emitter');

function ApiClient(url, options) {
    if (!url.endsWith('/')) url += '/';
    Emitter.call(this);

    this.baseUrl = url;
    this.options = (typeof(options) === 'object') ? options : {};

    // Make sure to set the defaults (by default)
    if (!this.options.defaults)
        this.options.defaults = {};

    this.auth = {
        token:      undefined,
        user:       undefined,
        profile:    undefined,
        magento:    undefined,
    };
}

extend(ApiClient, Emitter);
module.exports = ApiClient;


/**
 * Setup an angular app to track the digests of the internal promise instance
 */
ApiClient.trackDigests =
function trackDigests(angularApp) {
    angularApp.run(['$rootScope', function($rootScope) {
        BPromise.setScheduler(function(cb) {
            $rootScope.$evalAsync(cb);
        });
    }]);
};

// Create a reference to the rest-api's internal promise instance
ApiClient._internalPromise =
ApiClient.prototype._internalPromise = BPromise;


// -------


/**
 * Add a project id to the client, to be added to requests
 *
 * projectId:
 */
ApiClient.prototype.setProject =
ApiClient.prototype.projectId =
function(projectId) {
    this.options.project = projectId;
    return this;
};

/**
 * Authenticate an administrator for the client and save credentials
 *
 * credentials:
 * options:
 */
ApiClient.prototype.adminAuthenticate =
BPromise.method(function(credentials) {
    var url = this.baseUrl + 'auth/admin';

    if (this.options.project)
        credentials.projectId = this.options.project;

    debug('[ ] authenticate client: %s', url);
    return request
        .post(url)
        .send(credentials)
        .then(function(response) {
            this.auth.token   = response.body.token;
            this.auth.user    = response.body.user;
            this.auth.profile = response.body.profile;
            this.auth.magento = response.body.magento;

            debug(
                '[' + chalk.green('o') + '] authenticate client: ' + chalk.cyan('%s'),
                response.body.user.username
            );

            return [response.body,response];
        }.bind(this));
});

/**
 * Authenticate the client and save credentials
 *
 * credentials:
 * options:
 */
ApiClient.prototype.authenticate =
BPromise.method(function(credentials) {
    var url = this.baseUrl + 'auth/login';

    if (this.options.project)
        credentials.projectId = this.options.project;

    debug('[ ] authenticate client: %s', url);
    return request
        .post(url)
        .send(credentials)
        .then(function(response) {
            this.auth.token   = response.body.token;
            this.auth.user    = response.body.user;
            this.auth.profile = response.body.profile;
            this.auth.magento = response.body.magento;

            debug(
                '[' + chalk.green('o') + '] authenticate client: ' + chalk.cyan('%s'),
                response.body.user.username
            );

            return [response.body,response];
        }.bind(this));
});

/**
 * Refresh authenticated user information
 *
 */
ApiClient.prototype.refreshAuth =
BPromise.method(function refreshAuth(token) {
    token = token || this.auth.token;

    var url = this.baseUrl + 'api/info';

    debug('[ ] refresh auth information: %s', url);
    return request
        .get(url)
        .set('x-access-token', token)
        .then(function(response) {
            if (response.body.authUser)
                this.auth.user  = response.body.authUser;

            if (response.body.authProfile)
                this.auth.profile  = response.body.authProfile;

            debug(
                '[' + chalk.green('o') + '] refresh auth information: ' + chalk.cyan('%s'),
                url
            );

            return [response.body,response];
        }.bind(this));
});

/**
 * Check if the currently authenticated has permissions to access a particular
 * area
 *
 */
ApiClient.prototype.hasPermissions =
function authUserHasPermissions(levels, area, accessFor) {
    if (!this.auth.user)
        return false;
    // else:

    // If a specific area isn't provided, check the star-area
    area = area || '*';

    // If a particular access object isn't specified,
    // use the tenant, or the project
    accessFor = accessFor || this.options.project ||
                             this.auth.user.tenant ||
                             this.auth.user.project;
    if (accessFor && accessFor._id) accessFor = accessFor._id;

    // Use the normalized permissions object if it's available,
    // else just use the stored one
    var permissions = this.auth.user.access_normalized || this.auth.user.access;

    if (!permissions ||
        !permissions[accessFor])
        return false;
    // else:

    permissions = permissions[accessFor];

    if (permissions.permissions)
        permissions = permissions.permissions;

    return userHelpers.hasPermissions(permissions, area, levels);
};

/**
 * Generate a new ApiRequest with given common actions applied
 */
ApiClient.prototype.newRequest =
function(url, options) {
    // Set defaults
    if (typeof(options) !== 'object') options = {};
    options.defaults = options.defaults || this.options.defaults;
    options.apiClient = options.apiClient || this; // Make sure instance is set
                                                   // to be sent to the request

    var req = new ApiRequest(url, options);

    req.on('before-exec', function() {
        if (this.options.project &&
            !req.options.ignoreDefaults &&
            !req.options.ignoreProject)
            req.project(this.options.project);

        if (this.auth.token &&
            !req.options.ignoreDefaults &&
            !req.options.ignoreAuth)
            req.token(this.auth.token);
    }.bind(this));


    // Set event handlers for each request from the options.
    var requestEvents = options.requestEvents ||
                        this.options.requestEvents;
    if (typeof(requestEvents) === 'object')
        for (var event in requestEvents) {
            var handler = requestEvents[event];
            req.on(event, handler);
        }

    return req;
};

// Just sticking these routes right in here for now

[
    { url: 'api/logsGlobal',      props: ['logsGlobal'] },
    { url: 'api/logsOrder',       props: ['logsOrder'] },
    { url: 'api/order/claim',     props: ['claim'] },
    { url: 'api/order/reject',    props: ['reject'] },
    { url: 'api/orders',          props: ['order', 'orders'] },
    { url: 'api/orderStatuses',   props: ['status', 'statuses', 'orderStatuses'] },
    { url: 'api/users',           props: ['users', 'user'] },
    { url: 'api',                 props: ['root','base','single', 'one'] }
// Save new registration ID
].forEach(function(row) {
    var getFunction = function() {
        var url = this.baseUrl + row.url;
        var req = this.newRequest(url);

        return req;
    };

    row.props.forEach(function(prop) {
        Object.defineProperty(ApiClient.prototype, prop, {
            get: getFunction,
        });
    });
});

// Register extra endpoints
require('./endpoints').register(ApiClient);
