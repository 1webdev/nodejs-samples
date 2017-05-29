/**
 * Add Pagination to a query
 *
 * @module lib/query
 */

'use strict';

var debug = require('debug')('rest-api:lib:query:paging'),
    chalk = require('chalk');

/**
 * Add Pagination to a query
 *
 * @param {Object} query - mongoose query
 * @param {Number} limit - how many results
 * @param {Number} page - which page of results
 *
 * @returns {Object} * - The generated query
 */
module.exports =
function buildQueryPagination(query, limit, page) {
    
    if (limit !== 0 || !isNaN(limit)) {
        
        if (limit < 0 || isNaN(limit)) limit = 12;

        debug('query.limit\t -> ' + chalk.blue('%s'), limit);
        debug('query.page\t -> '  + chalk.blue('%s'), page);

        if(limit) {
            query.limit = limit;
            query.offset = (page - 1) * limit;
        }
    }

    return query;
};
