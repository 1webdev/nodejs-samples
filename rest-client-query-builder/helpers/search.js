/**
 * Add a general search to a query
 *
 * @module lib/query
 */

'use strict';

var debug = require('debug')('rest-api:lib:query:q');

/**
 * Add a search to a query
 *
 * @param {Object} query - query
 * @param {String} search - search query
 * @param {Array} searchFields - (optional) List of fields to search through
 *
 * @returns {Object} * - The generated query
 */
module.exports =
function buildQuerySearch(query, search, searchFields) {
    if (search) {
        // Trim whitespace
        if (search.trim) search = search.trim();
        if (searchFields) searchFields = searchFields.split(',');
        if (!searchFields || !searchFields.length) {
            searchFields = [
                'name'
            ];
        }

        debug('searching fields: ', searchFields);

        if(!query.where){
            query.where = {}
        }
        if(query.where.$or || searchFields.length > 1){
            if(!query.where.$or) query.where.$or=[];
            query.where.$or.push(searchFields.map(function(term) {
                var result = {};
                result[term] = {$like:search};
                return result;
            }));
        }else{
            query.where[searchFields[0]] = {$like:search};
        }

        
    }

    return query;
};
