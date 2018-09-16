var Joi = require('joi'),
    squel = require('squel').useFlavour('postgres'),
    config = require('../config'),
    pgp = require('pg-promise')();
const db = require('../config/db.js');

function formatSQL(request) {

    var sql = squel
        .update()
        .table(request.params.table)
        //.set("permitting_rolt_number", request.params.permitting_rolt_number)
        .set("second_franchise_town", request.payload.second_franchise_town)
        .set("second_hamlet", request.payload.second_hamlet)
        .set("second_street", request.payload.second_street)
        .set("second_cross_street", request.payload.second_cross_street)
        .set("second_utility_strip_width", request.payload.second_utility_strip_width)
        .set("second_lat_long", request.payload.second_lat_long)
        .set("second_riser_pole", request.payload.second_riser_pole)
        .set("second_permitting_agency", request.payload.second_permitting_agency)
        .set("second_road_type", request.payload.second_road_type)
        .set("second_pictures", request.payload.second_pictures)

        .where("id =" + request.params.id);
    console.log(sql.toString());

    return sql.toString();
}

module.exports = [{
    method: 'POST',
    path: '/update_permitting_table_second_location/v1/{table},{permitting_rolt_number},{id}',
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
                second_franchise_town: Joi.string().description("What Column"),
                second_hamlet: Joi.string().description("What Column"),
                second_street: Joi.string().description("What Column"),
                second_cross_street: Joi.string().description("What Column"),
                second_utility_strip_width: Joi.string().description("What Column"),
                second_lat_long: Joi.string().description("What Column"),
                second_riser_pole: Joi.string().description("What Column"),
                second_permitting_agency: Joi.string().description("What Column"),
                second_road_type: Joi.string().description("What Column"),
                second_pictures: Joi.string().description("What Column")
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
