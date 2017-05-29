/**
 * Exclude results from the query
 *
 * @module lib/query
 */

'use strict';

var debug = require('debug')('rest-api:lib:query:exclude');
var _ = require('underscore');

/**
 * Exclude results from a query
 *
 * @param {Object} query - mongoose query
 * @param {String} exclude - fields to exclude
 *
 * @returns {Object} * - The generated query
 */
module.exports =
function buildExcludeQuery(query, exclude) {
    // Exclude certain ids from the result set
    if (exclude) {
        // Select where the id is not in the list of excluded ids
        var excludes = _.uniq(exclude.split(',')
                              .map(function(value) { // Trim white-space
                                  if (value.trim)
                                      return value.trim();
                                  else
                                      return value;
                              }));

        debug('query.exclude\t -> \r\n', excludes);

        query.where({ _id: { $nin:excludes } });
    }

    return query;
};
