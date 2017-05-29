/**
 * Query a field
 *
 * @module lib/query
 */

'use strict';

var debug = require('debug')('rest-api:lib:query:q');

var db = require(_root + '/app/models');

/**
 * Query a field
 *
 * @param {Object} query - mongoose query
 * @param {Array} fieldName - A list of keys to search through
 * @param {Object} req - A request object
 *
 * @returns {Object} * - The generated query
 */
module.exports =
function buildFieldQuery(query, fieldName, req, model, db) {
    
    if(!query.where){
        query.where = {}
    }
        
    //console.log(query.where);
        
    var keys = fieldName;
    if (!Array.isArray(keys))
        keys = [keys];

    keys.forEach(function(key) {
        var modelField, paramName, isAgeAttribute = false;

        if (typeof(key) === 'object') {
            modelField = key.field || key.model ||
                         key.fieldName || key.modelName ||
                         key.modelField;
            paramName = key.param || key.queryParam || key.paramName;
            isAgeAttribute = key.isAgeAttribute;
        } else {
            modelField =
            paramName = key;
        }
        if (!req.query[paramName]) return;

        var q = {};
        var condition = {};
        var isSearchingFor = true;
        var whereIs = [],
            whereNot = [];

        req.query[paramName]
           .split(',')
           .forEach(function(value) { // Trim white-space
               var age;
               if (value.trim)
                   value = value.trim();

               var is = true;
               if (value[0] === '-') {
                   value = value.substr(1);
                   is = false;
               }

               // Range-related logic
               if (/^(\$([gl]te?|eq):)/.test(value)) {
                   var searchOp = value.split(':')[0];
                   var isIncluding = false;
                   // Placeholder for now, useful if we have parallel
                   // functionality in the request endpoints
                   switch (searchOp) {
                       case '$gte':
                           searchOp = isAgeAttribute ? '$lte' : '$gte';
                           isIncluding = true;
                           break;
                       case '$lte':
                           searchOp = isAgeAttribute ? '$gte' : '$lte';
                           isIncluding = true;
                           break;
                       case '$gt':
                           searchOp = isAgeAttribute ? '$lt' : '$gt';
                           break;
                       case '$lt':
                           searchOp = isAgeAttribute ? '$gt' : '$lt';
                           break;
                   }


                   
                   var opValue = value.substr(value.indexOf(':') + 1);
                   var isNumber = !isNaN(opValue);
                   var canBeDate = models.isTypeInSchema(query.model, 'Date', modelField);

                   if (isAgeAttribute && isNumber) {
                       age = parseInt(opValue, 10) + (isIncluding ? 0 : 1);
                       condition[searchOp] = getDateForAge(age);
                       return;
                   }

                   condition.$exists = true;
                   // If the value isn't a number, assume that it's a date
                   if (isNumber)
                        condition[searchOp] = opValue;
                   else if (canBeDate)
                        condition[searchOp] = new Date(opValue);
                   else
                        condition[searchOp] = opValue;

                   return;
               } ///^(\$[gl]te?:)/.test(value)

               if (value === '$null') {
                   value = null;
               }
               if (value === '$true') {
                   value = true;
               }
               if (value === '$false') {
                   value = false;
               }

               // allow to search by RegExp only for fields which are
               // defined with data type "String" in schema definition
               // - (see #DYNQRA-161)
               if (req.query.regexFind &&
                   models.isStringInSchema(query.model, modelField))
                   value = new RegExp(value, 'i');

               if (isAgeAttribute && !isNaN(value)) {
                   age = parseInt(value, 10);
                   // add the exact year criteria (allow to search by exact year (see profile.getAll))
                   condition = { $exists: true, $gt: getDateForAge(age + 1), $lt: getDateForAge(age + 0) };
                   return;
               }

               if (is) {
                   whereIs.push(value);
               } else {
                   whereNot.push(value);
               }
           });

        if (modelField[0] === '-') {
            isSearchingFor = false;
            modelField = modelField.substr(1);
        }

        if (isSearchingFor) {
            if (whereIs.length)  condition = {$in: whereIs};
            if (whereNot.length) condition = {$nin: whereNot};
        } else {
            if (whereIs.length)  condition = {$nin: whereIs};
            if (whereNot.length) condition = {$in: whereNot};
        }
        
        query.where[modelField] = condition;
        //query.where = q;
    });

    return query;
};

