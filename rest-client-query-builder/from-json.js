'use strict';

var allowedCommands = [
    'where', 'all', 'and', 'batchSize', 'box', 'cast', 'circle',
    'comment', 'count', 'distinct', 'elemMatch', 'equals', 'exec', 'exists',
    'geometry', 'gt', 'gte', 'hint', 'in', 'intersects', 'lean', 'limit',
    'lt', 'lte', 'maxDistance', 'maxScan', 'merge', 'mod', 'ne', 'near',
    'nin', 'nor', 'or', 'polygon', 'populate', 'read', 'regex', 'select',
    'selected', 'selectedExclusively', 'selectedInclusively', 'setOptions',
    'size', 'skip', 'slice', 'snapshot', 'sort', 'stream', 'tailable', 'then',
    'where', 'within',
];

var QueryError = require(_root + '/lib/errors/query');

/**
 * Return a function that turns a json query into a mongoose query
 *
 *  [
 *      { function: [args...] }
 *  ]
 */
module.exports = function(mongoose) {
    mongoose = mongoose || require('mongoose');

    return function jsonToQuery(q, model) {
        var err;
        // Make sure a query was passed
        if (!q) {
            err = new QueryError('error.query.no-query', 4003);
            err.status = 400;
            throw err;
        }

        // Make sure a model was passed
        if (!model) {
            err = new QueryError('error.query.no-model', 4902);
            err.status = 400;
            throw err;
        }

        if (typeof(model) === 'string')
            model = mongoose.model(model);

        var query;

        if (q[0] && (q[0].find || q[0].findOne)) {
            var find = q.shift();
            if (find.find)
                query = model.find(find.find);
            else
                query = model.findOne(find.findOne);
        } else {
            query = model.find();
        }

        /**
         * command --> { func: args }
         */
        q.forEach(function(command) {
            for (var func in command) {
                var args = command[func];
                if (allowedCommands.indexOf(func) !== -1) {
                    if (Array.isArray(args))
                        query[func].apply(query, args);
                    else
                        query[func](args);
                }
            }
        });

        return query;
    };
};
