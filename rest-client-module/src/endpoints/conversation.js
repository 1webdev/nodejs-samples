'use strict';

var extend = require('../lib/extend'),
    ApiRequest = require('../request');

function ConversationRequest(url, options) {
    url += 'api/conversations';

    ApiRequest.call(this, url, options);
}

extend(ConversationRequest, ApiRequest);
module.exports = ConversationRequest;

ConversationRequest.prototype.unread =
function() {
    return this.setPostfix('unread')
               .get();
};

ConversationRequest.prototype.status =
function() {
    return this.setPostfix('status')
               .put();
};

ConversationRequest.register =
function(ApiClient) {
    var getFunc = function getConversationRequest() {
        var req = new ConversationRequest(this.baseUrl);

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

    ['conversation','convo','convos','conversations'].forEach(function(prop) {
        Object.defineProperty(ApiClient.prototype, prop, {
            get: getFunc,
        });
    });
};
