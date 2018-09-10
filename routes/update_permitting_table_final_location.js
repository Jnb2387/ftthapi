var Joi = require('joi'),
    squel = require('squel').useFlavour('postgres'),
    config = require('../config'),
    pgp = require('pg-promise')();
const db = require('../config/db.js');

function formatSQL(request) {

    var sql = squel
        .update()
        .table(request.params.table)
        .set("permitting_rolt_number", request.params.permitting_rolt_number)
        .set("franchise_town", request.payload.franchise_town)
        .set("hamlett", request.payload.hamlett)
        .set("street", request.payload.street)
        .set("cross_street", request.payload.cross_street)
        .set("utility_strip_width", request.payload.utility_strip_width)
        .set("lat_long", request.payload.lat_long)
        .set("riser_pole", request.payload.riser_pole)
        .set("permitting_agency", request.payload.permitting_agency)
        .set("road_type", request.payload.road_type)
        .set("pictures", request.payload.pictures)

        .where("id =" + request.params.id);
    console.log(sql.toString());

    return sql.toString();
}

module.exports = [{
    method: 'POST',
    path: '/update_permitting_table_final_location/v1/{table},{permitting_rolt_number},{id}',
    config: {
        description: 'Update the permitting table',
        notes: 'Update permitting table.',
        tags: ['api'],
        validate: {
            params: {
                table: Joi.string().required().description('Name of the Table').default('ftth.permitting'),
                permitting_rolt_number: Joi.string().description('What Rolt'),
                id: Joi.number().integer().description('The ID for edit point.'),
            },
            query: {
            },
            payload: {
                franchise_town: Joi.string().description("What Column"),
                hamlett: Joi.string().description("What Column"),
                street: Joi.string().description("What Column"),
                cross_street: Joi.string().description("What Column"),
                utility_strip_width: Joi.string().description("What Column"),
                lat_long: Joi.string().description("What Column"),
                riser_pole: Joi.string().description("What Column"),
                permitting_agency: Joi.string().description("What Column"),
                road_type: Joi.string().description("What Column"),
                pictures: Joi.string().description("What Column"),
                // approved_final_location: Joi.string().description("What Column"),
                // permit__: Joi.string().description("What Column"),
                // blocked_y_n_: Joi.string().description("What Column"),
                // blocked_by: Joi.string().description("What Column"),
                // blocker_owner: Joi.string().description("What Column"),
                // eta_blocker_resolution: Joi.string().description("What Column"),
                // blocker_description: Joi.string().description("What Column")
            }
        },
        jsonp: 'callback',
        cache: config.cache,
        handler: function (request, reply) {
            db
                .query(formatSQL(request))
                .then(function (data) {
                    reply("First Location Successfully Updated");
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
