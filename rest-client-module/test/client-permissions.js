'use strict';


var should = require('should');
// var sinon = require('sinon');

describe('ApiClient - Permissions', function() {
    var ApiClient;
    var client;

    before(function() {
        ApiClient = require('../src');
    });

    beforeEach(function() {
        client = new ApiClient('http://dev.iqrestapinodejs.cloudcontrolled.com/');
    });

    describe('#refreshAuth', function() {
        it('should be a function', function() {
            client.refreshAuth.should.be.a.Function();
        });
    });

    describe('#hasPermissions', function() {
        it('should be a function', function() {
            client.hasPermissions.should.be.a.Function();
        });

        it('should return false when client not authenticated', function() {
            should(client.hasPermissions()).be.false();
        });

        it('should succeed when given user with proper permissions', function() {
            client.auth.user = {
                tenant: 'tnt::a',
                access: {
                    'tnt::a': {
                        '*':'*'
                    }
                }
            };


            should(client.hasPermissions('read', '*', 'tnt::a')).be.true();
        });

        it('should succeed when given user with proper permissions, with defaults', function() {
            client.auth.user = {
                tenant: 'tnt::a',
                access: {
                    'tnt::a': {
                        '*':'*'
                    }
                }
            };


            should(client.hasPermissions()).be.true();
        });
    });
});
