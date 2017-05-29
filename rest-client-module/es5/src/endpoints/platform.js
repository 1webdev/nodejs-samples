'use strict';

var extend = require('../lib/extend'),
    ApiRequest = require('../request');

function PlatformRequest(url, options) {
    url += 'api/sns/platforms';

    ApiRequest.call(this, url, options);
}

extend(PlatformRequest, ApiRequest);
module.exports = PlatformRequest;

PlatformRequest.prototype.publish = function () {
    return this.setPostfix('publish');
};

PlatformRequest.prototype.subscribe = function (deviceId) {
    var postfix = 'subscribe';
    if (deviceId) postfix += '/' + deviceId;
    return this.setPostfix(postfix);
};

PlatformRequest.prototype.unsubscribe = function (deviceId) {
    var postfix = 'unsubscribe';
    if (deviceId) postfix += '/' + deviceId;
    return this.setPostfix(postfix);
};

PlatformRequest.register = function (ApiClient) {
    var getFunc = function getPlatformRequest() {
        var req = new PlatformRequest(this.baseUrl);

        req.on('before-exec', function () {
            if (this.options.project && !req.options.ignoreDefaults && !req.options.ignoreProject) req.project(this.options.project);

            if (this.auth.token && !req.options.ignoreDefaults && !req.options.ignoreAuth) req.token(this.auth.token);
        }.bind(this));

        return req;
    };

    ['platforms', 'platform', 'plt'].forEach(function (prop) {
        Object.defineProperty(ApiClient.prototype, prop, {
            get: getFunc
        });
    });
};