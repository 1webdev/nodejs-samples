'use strict';

var extend = require('../lib/extend'),
    ApiRequest = require('../request');

function InfoRequest(url, options) {
    url += 'api/info';

    ApiRequest.call(this, url, options);
}

extend(InfoRequest, ApiRequest);
module.exports = InfoRequest;

InfoRequest.register = function (ApiClient) {
    var getFunc = function getInfoRequest() {
        var req = new InfoRequest(this.baseUrl);

        req.on('before-exec', function () {
            if (this.options.project && !req.options.ignoreDefaults && !req.options.ignoreProject) req.project(this.options.project);

            if (this.auth.token && !req.options.ignoreDefaults && !req.options.ignoreAuth) req.token(this.auth.token);
        }.bind(this));

        return req;
    };

    ['info'].forEach(function (prop) {
        Object.defineProperty(ApiClient.prototype, prop, {
            get: getFunc
        });
    });
};