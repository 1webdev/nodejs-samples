'use strict';

var extend = require('../lib/extend'),
    ApiRequest = require('../request');

function AuthRequest(url, options) {
    url += 'auth';

    ApiRequest.call(this, url, options);
}

extend(AuthRequest, ApiRequest);
module.exports = AuthRequest;

AuthRequest.register = function (ApiClient) {
    var getFunc = function getAuthRequest() {
        var req = new AuthRequest(this.baseUrl);

        req.on('before-exec', function () {
            if (this.options.project && !req.options.ignoreDefaults && !req.options.ignoreProject) req.project(this.options.project);

            if (this.auth.token && !req.options.ignoreDefaults && !req.options.ignoreAuth) req.token(this.auth.token);
        }.bind(this));

        return req;
    };

    ['authorization', 'authEndpoint'].forEach(function (prop) {
        Object.defineProperty(ApiClient.prototype, prop, {
            get: getFunc
        });
    });
};