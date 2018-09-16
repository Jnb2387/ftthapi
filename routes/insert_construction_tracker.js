var Joi = require('joi'),
    squel = require('squel').useFlavour('postgres'),
    config = require('../config'),
    pgp = require('pg-promise')();
const db = require('../config/db.js');

function formatSQL(request) {

    var sql = squel
        .insert()
        .into(request.params.table)
        .set("pni_cell_name", request.payload.pni_cell_name)
        .set("jso_location", request.payload.jso_location)
        .set("start_device", request.payload.start_device)
        .set("end_device", request.payload.end_device)
        .set("fiber_count", request.payload.fiber_count)
        .set("homes_passed", request.payload.homes_passed)
        .set("cbs", request.payload.cbs)
        .set("ug", request.payload.ug)
        .set("mdu", request.payload.mdu)
        .set("route", request.payload.route)
        .set("start_footage", request.payload.start_footage)
        .set("end_footage", request.payload.end_footage)
        .set("total_placed", request.payload.total_placed)
        .set("placed", request.payload.placed)
        .set("total_pdo", request.payload.total_pdo)
        .set("pdo_spliced", request.payload.pdo_spliced)
        .set("date_issued", request.payload.date_issued)
        .set("cabled_complete", request.payload.cabled_complete)
        .set("pdo_complete", request.payload.pdo_complete)
        .set("jso_spliced", request.payload.jso_spliced)
        .set("pdo_jso_complete", request.payload.pdo_jso_complete)
        .set("feeder_spliced", request.payload.feeder_spliced)
        .set("pdo_jso_feeder_complete", request.payload.pdo_jso_feeder_complete)
        .set("feeder_to_odf_rolt_spliced", request.payload.feeder_to_odf_rolt_spliced)
        .set("backhaul_spliced", request.payload.backhaul_spliced)
        .set("pdo_to_odf", request.payload.pdo_odf)
        .set("tested", request.payload.tested)
        // .where("id =" + request.query.id);
    console.log(sql.toString());

    return sql.toString();
}

module.exports = [{
    method: 'POST',
    path: '/insert_construction_tracker/v1/{table}',
    config: {
        description: 'Insert the construction table',
        notes: 'Insert construction table.',
        tags: ['api'],
        validate: {
            params: {
                table: Joi.string().required().description('Name of the Table').default('ftth.construction_cell_tracker'),
            },
            query: {
                id: Joi.number().integer().description('The ID for edit point.'),
            },
            payload: {
                pni_cell_name: Joi.string().description('What permitting rolt'),
                jso_location: Joi.string().description('What permitting rolt'),
                start_device: Joi.string().allow('').description("What Column"),
                end_device: Joi.string().allow('').description("What Column"),
                fiber_count: Joi.string().allow('').description("What Column"),
                homes_passed: Joi.string().allow('').description("What Column"),
                cbs: Joi.string().allow('').description("What Column"),
                ug: Joi.string().allow('').description("What Column"),
                mdu: Joi.string().allow('').description("What Column"),
                route: Joi.string().allow('').description("What Column"),
                start_footage: Joi.string().allow('').description("What Column"),
                end_footage: Joi.string().allow('').description("What Column"),
                total_placed: Joi.string().allow('').description("What Column"),
                placed: Joi.string().allow('').description("What Column"),
                total_pdo: Joi.string().allow('').description("What Column"),
                pdo_spliced: Joi.string().allow('').description("What Column"),
                date_issued: Joi.string().allow('').description("What Column"),
                cabled_complete: Joi.string().allow('').description("What Column"),
                pdo_complete: Joi.string().allow('').description("What Column"),
                jso_spliced: Joi.string().allow('').description("What Column"),
                pdo_jso_complete: Joi.string().allow('').description("What Column"),
                feeder_spliced: Joi.string().allow('').description("What Column"),
                pdo_jso_feeder_complete: Joi.string().allow('').description("What Column"),
                feeder_to_odf_rolt_spliced: Joi.string().allow('').description("What Column"),
                backhaul_spliced: Joi.string().allow('').description("What Column"),
                pdo_to_odf: Joi.string().allow('').description("What Column"),
                tested: Joi.string().allow('').description("What Column"),
            }
        },
        jsonp: 'callback',
        cache: config.cache,
        handler: function (request, reply) {
            db
                .query(formatSQL(request))
                .then(function (data) {
                    var returndata = {
                        "data": [{
                            "pni_cell_name": request.payload.pni_cell_name,
                            "jso_location": request.payload.jso_location,
                            "start_device": request.payload.start_device,
                            "end_device": request.payload.end_device,
                            "fiber_count": request.payload.fiber_count,
                            "homes_passed": request.payload.homes_passed,
                            "cbs": request.payload.cbs,
                            "ug": request.payload.ug,
                            "mdu":request.payload.mdu,
                            "route":request.payload.route,
                            "start_footage":request.payload.start_footage,
                            "end_footage":request.payload.end_footage,
                            "total_placed":request.payload.total_placed,
                            "placed":request.payload.placed,
                            "total_pdo": request.payload.total_pdo,
                            "pdo_spliced":request.payload.pdo_spliced,
                            "date_issued":request.payload.date_issued,
                            "cabled_complete":request.payload.cabled_complete,
                            "pdo_complete":request.payload.pdo_complete,
                            "jso_spliced":request.payload.jso_spliced,
                            "pdo_jso_complete":request.payload.pdo_jso_complete,
                            "feeder_spliced":request.payload.feeder_spliced,
                            "pdo_jso_feeder_complete":request.payload.pdo_jso_feeder_complete,
                            "feeder_to_odf_rolt_spliced":request.payload.feeder_to_odf_rolt_spliced,
                            "backhaul_spliced":request.payload.backhaul_spliced,
                            "pdo_to_odf":request.payload.pdo_to_odf,
                            "tested":request.payload.tested,

                            "id": request.query.id

                        }]
                    }
                    reply(returndata);
                })
                .catch(function (err) {
                    reply({
                        'error': 'error running query',
                        'error_details': err
                    });
                });
        }
    }
}];
