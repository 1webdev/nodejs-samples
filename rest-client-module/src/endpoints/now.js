'use strict';

var extend = require('../lib/extend'),
    ApiRequest = require('../request');

function NowRequest(url, options) {
    url += 'api/now';

    ApiRequest.call(this, url, options);
}

extend(NowRequest, ApiRequest);
module.exports = NowRequest;

NowRequest.register =
function(ApiClient) {
    var getFunc = function getNowRequest() {
        var req = new NowRequest(this.baseUrl);

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

        return req;
    };

    ['now'].forEach(function(prop) {
        Object.defineProperty(ApiClient.prototype, prop, {
            get: getFunc,
        });
    });
};
