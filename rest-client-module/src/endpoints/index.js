'use strict';

var allEndpoints = {
    info: require('./info'),
    now: require('./now'),
    conversation: require('./conversation'),
    poi: require('./poi'),
    auth: require('./auth'),
    profile: require('./profile'),
    topic: require('./topic'),
    platform: require('./platform'),
};

module.exports = {
    all: allEndpoints,
    register: function(ApiClient, options) {
        for (var key in allEndpoints) {
            allEndpoints[key].register(ApiClient, options);
        }
    }
};
