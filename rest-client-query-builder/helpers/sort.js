/**
 * Sort a query
 *
 * @module lib/query
 */

'use strict';

var debug = require('debug')('rest-api:lib:query:q'),
    chalk = require('chalk');

/**
 * Sort a query
 *
 * @param {Object} query - mongoose query
 * @param {String} sort - field(s) to sort by
 *
 * @returns {Object} * - The generated query
 */
module.exports =
function buildQuerySort(query, sort) {
    if (sort) {
        sort = sort.split(',');
        if (!sort || !sort.length) {
            sort = [
                '-createdAt'
            ];
        }
        sort = sort.map(function(item){
            if(item.indexOf('-')===0){
                item = item.slice(1) + ' DESC'
            }else{
                item +=' ASC';
            }
            return item.split(' ');
        });
        //sort = sort.join(', ')
        
        query.order =  sort;
    }

    return query;
};
