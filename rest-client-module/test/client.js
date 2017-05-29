'use strict';

return;

require('should');
var sinon = require('sinon');

describe.skip('ApiClient', function() {
    var ApiClient;
    var client;

    before(function() {
        ApiClient = require('../');
    });

    it('should construct', function() {
        client = new ApiClient('http://localhost:3000/');
    });

    beforeEach(function() {
        // client = new ApiClient('http://localhost:3000');
        client = new ApiClient('http://dev.iqrestapinodejs.cloudcontrolled.com/');
    });

    it('should authenticate', function(done) {
        var credentials = {
            username: 'brandNewUser', 
            password: 'test',
        };

        client
            .authenticate(credentials)
            .spread(function(data, response) {
                done();
            })
            .catch(function(err) {
            });
    });

    it('should get devices', function(done) {
        client
            .devices
            .limit(1)
            .spread(function(data) {
                done();
            });
    });

    it('should get a specific device', function(done) {
        client
            .devices
            .id('dev::1cf663c8-c352-3564-a26c-84e3ad94596a')
            .spread(function(data) {
                done();
            });
    });

    it('should get a specific pls', function(done) {
        client
            .playlists
            .id('pls::5bb803ca-1704-4888-b7ca-ba2c29b9899f')
            .spread(function(data) {
                done();
            });
    });

    it('should patch a specific device', function(done) {
        client
            .devices
            .id('dev::1cf663c8-c352-3564-a26c-84e3ad94596a')
            .patch()
            .send([{op:'replace',path:'/approved',value:false}])
            .then(function(data) {
                // console.log('data:', data);
                // done();
            })
            .catch(function(err) {
                done();
            });
    });

    it('should patch a specific device', function(done) {
        var credentials = {
            username: 'brandNewUser', 
            password: 'test',
        };

        client
            .authenticate(credentials)
            .spread(function(data, response) {
                client
                    .devices
                    .id('dev::1cf663c8-c352-3564-a26c-84e3ad94596a')
                    .patch()
                    // .send([{op:'replace',path:'/approved',value:false}])
                    .send([])
                    .spread(function(data) {
                        console.log('data:', data);
                        done();
                    })
                    .catch(function(err) {
                        console.log(err.body);
                        done();
                    });
            })
            .catch(function(err) {
            });
    });

    it('should patch a specific device', function(done) {
        client
            .devices
            .id('dev::1cf663c8-c352-3564-a26c-84e3ad94596a')
            .patch()
            .send([{op:'replace',path:'/approved',value:false}])
            .then(function(data) {
                // console.log('data:', data);
                // done();
            })
            .catch(function(err) {
                done();
            });
    });

    it('should work with postfixes', function(done) {
        client
            .pois
            .id('poi::6adf42b0-6f1f-468d-bfe6-13e6e11ddd5c')
            .profiles()
            .then(function(data) {
                done();
            })
            .catch(function(err) {
                console.log(err);
                done(err);
            });
    });

    it('should work with counts', function(done) {
        client
            .pois
            .count()
            .spread(function(data) {
                data.should.be.a.Number;
                done();
            })
            .catch(function(err) {
                console.log(err);
                done(err);
            });
    });

});
