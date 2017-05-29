'use strict';

var options = {};
var ApiClient = require('b2t-rest-client'),
    client = new ApiClient('url', options);

client.project('prj::1');
client.authenticate({ username:'brandNewUser', password:'test' })
      .then(function(data) {
          // I'm authenticated!
      })
      .then(function() {
          return client.events.get(options)
      })
      .catch(function(err) {
      });

