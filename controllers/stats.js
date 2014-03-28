var ws = require('../ws');

var config = require('../config');

var moment = require('moment');
var async = require('async');

var mongo = require('mongodb');
var MongoClient = mongo.MongoClient;

var statements;
MongoClient.connect("mongodb://lrs:LRs56798242k@shanghai.uoc.es:27017/lrs", function(err, db) {
    db.createCollection('statements', function(err, collection) {
        statements = collection;
    });
});


/**
 * [bydomainid description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var bydomainid = exports.bydomainid = function(req, res, next) {
    
    var anyAcademic = '20132';
    var codAssignatura = '00.023';
    var codAula = '1';
    var domainId = '437765';

    var connexions = function(estudiant, next) {

        var idp = estudiant.tercer[0].idp[0];
        var data = {
            "$and":[
                { "actor.account.name" : config.util.format("%s", idp) },
                { "context.extensions.uoc:lrs:app" : "aulaca" },
                { "context.extensions.uoc:lrs:classroom:id": config.util.format("%s", domainId) }
            ]
        };

        statements.find(data, { 'sort': [['stored','asc']], 'limit': 1 }).toArray(function(err, docs) {
            estudiant.connexio = docs;
            return next(err, docs);
        });
    }

    ws.rac.getEstudiantsPerAula(anyAcademic, codAssignatura, codAula, function(err, result) {
        if (err) return next(err);
        if (result.out.EstudiantAulaVO) {
            async.each(result.out.EstudiantAulaVO, connexions, function(err) {
                if (err) return next(err);
                return res.json(result.out.EstudiantAulaVO);
            });
        } else {
            return next();
        }
    });
}

/**
 * [heatmap description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var heatmap = exports.heatmap = function (req, res, next) {

    if (req.query.format != 'json') {
        return res.render('heatmap.html', { object: { s: req.query.s }});
    }

    var hm = [];
    var actual = moment('2014-03-17T00:00:00.000');
    var fi = moment('2014-03-23T23:00:00.000');

    var domainId = '438224';

    var getCount = function(hour, next) {
        var data = {
            "$and":[
                { "context.extensions.uoc:lrs:app" : "aulaca" },
                { "timestamp": { "$regex": config.util.format("%s", hour.filter) } },
                { "context.extensions.uoc:lrs:subject:id": config.util.format("%s", domainId) }
            ]
        };
        statements.count(data, function(err, docs) {
            if (err) return next(err);
            config.debug(docs);
            hour.value = docs;
            return next();
        });
    }

    async.whilst(
        function () {
            return actual.isBefore(fi);
        },
        function (next) {
            hm.push({
                filter: actual.format('YYYY-MM-DDTHH'),
                day: actual.weekday(),
                hour: actual.get('hour')
            });
            actual = actual.add('hours', 1);
            return next();
        },
        function (err) {
            async.each(hm, getCount, function(err) {
                if (err) return next(err);
                return res.json(hm);
            });
        }
    );
}

/**
 * [heatmap description]
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
var heatmap_ = exports.heatmap_ = function (req, res, next) {

    if (req.query.format != 'json') {
        return res.render('heatmap.html', { object: { s: req.query.s }});
    }

    var hm = [];
    var actual = moment('2014-02-26T00:00:00.000');
    var fi = moment('2014-02-27T00:00:00.000');

    var getCount = function(hour, next) {
        ws.lrs.bydatetime(hour.filter, function (err, data) {
            if (err) return next(err);
            hour.value = data.value;
            return next();
        });
    }

    async.whilst(
        function () {
            return actual.isBefore(fi);
        },
        function (next) {
            hm.push({
                filter: actual.format('YYYY-MM-DDTHH'),
                day: actual.weekday(),
                hour: actual.get('hour')
            });
            actual = actual.add('hours', 1);
            return next();
        },
        function (err) {
            async.each(hm, getCount, function(err) {
                if (err) return next(err);
                return res.json(hm);
            });
        }
    );
}