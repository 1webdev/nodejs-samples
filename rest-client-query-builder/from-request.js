/**
 * Build a query based on request parameters
 *
 * @module lib/query
 */

'use strict';

var chalk = require('chalk');
var debug = require('debug')('rest-api:lib:build-query');
var queryField = require(_root + '/lib/queries/helpers/query-field');

var Models = require(_root + '/app/models');

var buildSearch = require(_root + '/lib/queries/helpers/search');
var buildPagination = require(_root + '/lib/queries/helpers/pagination');
var buildSorting = require(_root + '/lib/queries/helpers/sort');
//var buildExcluding = require(_root + '/lib/queries/helpers/exclude');

/**
 * Build a query for handling many objects
 *
 * @param {Object} query - starting mongoose query to be built
 * @param {Object} req - request object to determine how to query
 * @param {Object} options
 *
 * @returns {Object} *
 */
exports.many =
function buildManyQuery(query, req, model, db) {
    
    debug(chalk.cyan('buildManyQuery'));

    
    var search =    req.query.search || req.query.q,
        fields =    req.query.searchTerms ||
                    req.query.terms ||
                    req.query.searchFields ||
                    req.query.fields,
        page =      parseInt(req.query.page) || 1,
        limit =     parseInt(req.query.limit),
        count =     req.query.count,
        sort =      req.query.sort || '-createdAt';

    var ignoredKeys = ['project'];
    var queryParameters = [];
    var queriedKeys = [];
    var key, size = 0;
    
    for (key in req.query) {
        if(
            key != 'search' && key != 'q' &&
            key != 'searchTerms' && key != 'terms' && key != 'searchFields' && key != 'fields' &&
            key != 'page' && 
            key != 'limit' && 
            key != 'count' && 
            key != 'sort' &&
            key != 'include'
        ) {
           
            if (ignoredKeys.indexOf(key) === -1) {
                queryField(query, [key, '-' + key], req, model, db);
                queryParameters.push(key);
                queryParameters.push('-' + key);
                query[key] = req.query[key];
                size++;
            }
        }
    }

    // q - general search
    buildSearch(query, search, fields);
    // Only do these operations when we're not dealing with a count request,
    // count requests only return a number, so all of this would be worthless
    // otherwise
    
    // Pagination
    buildPagination(query, limit, page);
    // Sort results
    buildSorting(query, sort);


    if (count) {
        query.count = true;
    }

    query = exports.common(query, req, model, db);

    return query;
};

/**
 * Build a query for handling single objects
 *
 * @param {Object} query - starting mongoose query to be built
 * @param {Object} req - request object to determine how to query
 * @param {Object} options
 *
 * @returns {Object} *
 
exports.one =
function buildOneQuery(query, req, options) {
    options = options || {};
    options.ignoreCountQuery = true;
    var debug = options.debug || _debug;
    debug(chalk.cyan('buildQueryOne'));

    exports.common(query, req, options);

    return query;
};
*/
/**
 * Common query options
 *
 * @param {Object} query - starting mongoose query to be built
 * @param {Object} req - request object to determine how to query
 * @param {Object} options
 *
 * @returns {Object} *
 */
exports.common =
function buildQueryCommon(query, req, model) {
    
    debug(chalk.cyan('buildQueryCommon'));

    var include =   req.query.include,
        select  =   req.query.select;
        
    // Populate selected fields
    if (include) {
        
        var includes = include.split(',');
        query.include = [];
        var subIncludes = [];
        includes.forEach(function(include) {
            include = include.trim();
            if(include.indexOf('.')!==-1){
                subIncludes.push(include);
            }else if ("including" in model){
                model.including(Models, include, query.include);
            }else if (model.associations && model.associations[include]){
                query.include.push(model.associations[include]);
            }
        });
        if ("including" in model){
            subIncludes.forEach(function(include){
                model.including(Models, include, query.include);
            });
        }
        console.log(query.include);
    }
   
   /*console.log(model.associations['orderCustomer']);
    query.include = [{
        model: model.associations['orderCustomer'],
        where: { firstName: 'test'}
    }];*/

    if (select) {
        if(!query.attributes){
            query.attributes = [];
        }
        select = select.split(',');
        select.map(function(field){
            field = field.trim();
            if(model.rawAttributes[field])
                query.attributes.push(field);
        });
        
    }
    

    return query;
};
