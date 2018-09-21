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
        //.set("permitting_rolt_number", request.params.permitting_rolt_number)
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
         auth: 'simple',
        description: 'Update the permitting table',
        notes: 'Update permitting table.',
        tags: ['api'],
        validate: {
            params: {
                table: Joi.string().required().description('Name of the Table').default('ftth.permitting'),
                permitting_rolt_number: Joi.string().description('Permitting Rolt Number'),
                id: Joi.number().integer().description('The ID for the Feature.'),
            },
            query: {
            },
            payload: {
                franchise_town: Joi.string().description("Franchise Town"),
                hamlett: Joi.string().description("Hamlet"),
                street: Joi.string().description("Street"),
                cross_street: Joi.string().description("Cross Street"),
                utility_strip_width: Joi.string().replace(/'/g, "''").description("Utility Strip Width"),// THIS COLUMN HAS A SINGLE QUOTE IN THE FIELD SO IT SCREWS EVERTHING Up
                lat_long: Joi.string().description("Lat Long"),
                riser_pole: Joi.string().description("Riser Pole"),
                permitting_agency: Joi.string().description("Permitting Agency"),
                road_type: Joi.string().description("Road Type"),
                pictures: Joi.string().description("Pictures"),
            }
        },
        jsonp: 'callback',
        cache: config.cache,
        handler: function (request, reply) {
            db
                .query(formatSQL(request))
                .then(function (data) {
                    reply("Final Location Successfully Updated");
                })
                .catch(function (err) {
                    console.log(err)
                    reply({
                        'error': 'error running query',
                        'error_details': err
                    });
                });
        }
    }
}];
