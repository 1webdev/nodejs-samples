'use strict';

var extend = require('../lib/extend'),
    ApiRequest = require('../request');

function PoiRequest(url, options) {
    url += 'api/pois';

    ApiRequest.call(this, url, options);
}

extend(PoiRequest, ApiRequest);
module.exports = PoiRequest;

PoiRequest.prototype.profiles =
function() {
    return this.setPostfix('profiles');
               // .get();
};

PoiRequest.register =
function(ApiClient) {
    var getFunc = function getPoiRequest() {
        var req = new PoiRequest(this.baseUrl);

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

    ['poi','pois','place','places'].forEach(function(prop) {
        Object.defineProperty(ApiClient.prototype, prop, {
            get: getFunc,
        });
    });
};
