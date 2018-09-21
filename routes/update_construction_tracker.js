var BaseJoi = require('joi'),
    Extension = require('joi-date-extensions'),
    Joi = BaseJoi.extend(Extension),
    squel = require('squel').useFlavour('postgres'),
    config = require('../config'),
    pgp = require('pg-promise')(),
    db = require('../config/db.js');

function formatSQL(request) {

    var sql = squel
        .update()
        .table(request.params.table)
        // .set("permitting_rolt_number", request.params.permitting_rolt_number)
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
        .set("permitting_rolt_number", request.payload.permitting_rolt_number)



        .where("id =" + request.query.id);
    console.log(sql.toString());

    return sql.toString();
}

module.exports = [{
    method: 'POST',
    path: '/update_construction_tracker/v1/{table}',
    config: {
         auth: 'simple',
        description: 'Update the construction table',
        notes: 'Update construction table.',
        tags: ['api'],
        validate: {
            params: {
                table: Joi.string().required().description('Name of the Table').default('ftth.construction_cell_tracker'),
            },
            query: {
                id: Joi.number().integer().description('The ID for edit point.'),
            },
            payload: {
                pni_cell_name: Joi.string().replace(/'/g, "''").description('PNI Cell Name'),
                jso_location: Joi.string().replace(/'/g, "''").description('JSO Location'),
                start_device: Joi.string().replace(/'/g, "''").allow('').description("Start Device"),
                end_device: Joi.string().replace(/'/g, "''").allow('').description("End Device"),
                fiber_count: Joi.string().replace(/'/g, "''").allow('').description("Fiber Count"),
                homes_passed: Joi.string().replace(/'/g, "''").allow('').description("Homes Passed"),
                cbs: Joi.string().replace(/'/g, "''").allow('').description("CBS"),
                ug: Joi.string().replace(/'/g, "''").allow('').description("Underground"),
                mdu: Joi.string().replace(/'/g, "''").allow('').description("MDU"),
                route: Joi.string().replace(/'/g, "''").allow('').description("Route"),
                start_footage: Joi.string().replace(/'/g, "''").allow('').description("Start footage"),
                end_footage: Joi.string().replace(/'/g, "''").allow('').description("End Footage"),
                total_placed: Joi.string().replace(/'/g, "''").allow('').description("Total Placed"),
                placed: Joi.string().replace(/'/g, "''").allow('').description("Placed"),
                total_pdo: Joi.string().replace(/'/g, "''").allow('').description("Total PDO"),
                pdo_spliced: Joi.string().replace(/'/g, "''").allow('').description("PDO Spliced"),
                date_issued: Joi.date().format('M/DD/YYYY').raw().allow('').description("Date Issued"),
                cabled_complete: Joi.date().format('M/DD/YYYY').raw().allow('').description("Cabled Complete"),
                pdo_complete: Joi.date().format('M/DD/YYYY').raw().allow('').description("PDO Complete"),
                jso_spliced: Joi.date().format('M/DD/YYYY').raw().allow('').description("JSO Spliced"),
                pdo_jso_complete: Joi.date().format('M/DD/YYYY').raw().allow('').description("PDO JSO Complete"),
                feeder_spliced: Joi.string().replace(/'/g, "''").allow('').description("Feeder"),
                pdo_jso_feeder_complete: Joi.string().replace(/'/g, "''").allow('').description("PDO JSO Feeder Complete"),
                feeder_to_odf_rolt_spliced: Joi.string().replace(/'/g, "''").allow('').description("Feeder To ODF Rolt Spliced"),
                backhaul_spliced: Joi.string().replace(/'/g, "''").allow('').description("Backhaul Spliced"),
                pdo_to_odf: Joi.string().replace(/'/g, "''").allow('').description("PDO to ODF"),
                tested: Joi.string().replace(/'/g, "''").allow('').description("Tested"),
                permitting_rolt_number:Joi.string().replace(/'/g, "''").allow('').description("Permitting Rolt Number"),
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
                            "permitting_rolt_number":request.payload.permitting_rolt_number,
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
