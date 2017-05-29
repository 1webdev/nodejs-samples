'use strict';

var extend = require('../lib/extend'),
    ApiRequest = require('../request');

function ProfileRequest(url, options) {
    url += 'api/profiles';

    ApiRequest.call(this, url, options);
}

extend(ProfileRequest, ApiRequest);
module.exports = ProfileRequest;

ProfileRequest.prototype.stream =
function() {
    return this.setPostfix('stream')
               .get();
};

ProfileRequest.prototype.myStream =
ProfileRequest.prototype.personalStream =
function() {
    return this.setPostfix('personal-stream')
               .get();
};

ProfileRequest.prototype.following =
function(follower) {
    return this.setPostfix('following' + ((follower) ? '/' + follower : ''));
};

ProfileRequest.prototype.followers =
function(follower) {
    return this.setPostfix('followers' + ((follower) ? '/' + follower : ''));
};

ProfileRequest.register =
function(ApiClient) {
    var getFunc = function getProfileRequest() {
        var req = new ProfileRequest(this.baseUrl);

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

    ['profiles','profile','prf'].forEach(function(prop) {
        Object.defineProperty(ApiClient.prototype, prop, {
            get: getFunc,
        });
    });
};
