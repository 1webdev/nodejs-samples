'use strict';

var extend = require('../lib/extend'),
    ApiRequest = require('../request');

function TopicRequest(url, options) {
    url += 'api/sns/topics';

    ApiRequest.call(this, url, options);
}

extend(TopicRequest, ApiRequest);
module.exports = TopicRequest;

TopicRequest.prototype.publish = function () {
    return this.setPostfix('publish');
};

TopicRequest.prototype.subscribe = function (deviceId) {
    var postfix = 'subscribe';
    if (deviceId) postfix += '/' + deviceId;
    return this.setPostfix(postfix);
};

TopicRequest.prototype.unsubscribe = function (deviceId) {
    var postfix = 'unsubscribe';
    if (deviceId) postfix += '/' + deviceId;
    return this.setPostfix(postfix);
};

TopicRequest.register = function (ApiClient) {
    var getFunc = function getTopicRequest() {
        var req = new TopicRequest(this.baseUrl);

        req.on('before-exec', function () {
            if (this.options.project && !req.options.ignoreDefaults && !req.options.ignoreProject) req.project(this.options.project);

            if (this.auth.token && !req.options.ignoreDefaults && !req.options.ignoreAuth) req.token(this.auth.token);
        }.bind(this));

        return req;
    };

    ['topics', 'topic', 'top'].forEach(function (prop) {
        Object.defineProperty(ApiClient.prototype, prop, {
            get: getFunc
        });
    });
};