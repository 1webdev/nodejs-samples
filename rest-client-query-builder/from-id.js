'use strict';

var getModel = require(_root + '/lib/get-model'),
    regex = require(_root + '/lib/regex');

/**
 * Common function for getting an object by id
 */
module.exports = function(id, req, Model, mongoose) {
    mongoose = mongoose || require('mongoose');
    if (regex.id.test(id))
        Model = Model || getModel(id, mongoose);

    var query,
        include =   req.query.include,
        select =    req.query.select;


    // IF it's an id, use it
    if (regex.abbrevId.test(id)) {
        query = Model.findById(id);
    } else if (req.projectId || req.subProjectId) {
        var q = [];

        // If the given value is an email and the model
        // has an email field, use it
        if (Model.schema.paths.email && regex.email.test(id)) {
            var email = id;
            if (email && email.toLowerCase)
                email = email.toLowerCase();

            q.push({ email:email });
        }

        // device_id, mhm.
        if (Model.schema.paths.device_id) {
            q.push({ device_id:id });
        }

        // IF the model has a username field, try that
        if (Model.schema.paths.refId && isNaN(id)) {
            q.push({ refId:id });
        }

        // IF the model has a username field, try that
        if (Model.schema.paths.username && isNaN(id)) {
            q.push({ username:id });
        }

        if (q.length)
            query = Model.findOne()
                         .or(q);
    }

    // Just default back to trying the id
    if (!query) {
        query = Model.findById(id);
    }


    query.where('is_deleted').ne(true);

    if (query.schema.paths.project ||
        query.schema.paths.sub_project) {
        if (req.projectId || req.subProjectId) {
            if (req.projectId)
                query.where('project', req.projectId);
            if (req.subProjectId)
                query.where('sub_project', req.subProjectId);
        } else if (req.userProjects) {
            var ors = [];
            ors.push({ project:{ $in:req.userProjects } });
            ors.push({ tenant: req.tenantId });
            if (typeof(req.tenant) === 'string')
                ors.push({ tenant: req.tenant });

            query.or(ors);
        }
    }

    if (include) {
        var includes = include.split(',');
        if (includes.indexOf('relations') !== -1) {
            includes.splice(includes.indexOf('relations'), 1);
            includes.push('relations.pois');
            includes.push('relations.news');
            includes.push('relations.events');
            includes.push('relations.acts');
            includes.push('relations.profiles');
            includes.push('relations.devices');
            includes.push('relations.media');
            includes.push('relations.target.owner');
            includes.push('relations.target.target');
        }

        includes.forEach(function(include) {
            query.populate(include);
        });
    }

    if (select) {
        var selects = select.replace(/,/g, ' ');
        query.select(selects);
    }

    return query;
};
