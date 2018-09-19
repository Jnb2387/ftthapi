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
        // .set("rolt_status", request.payload.rolt_status)
        // .set("cabinet_type", request.payload.cabinet_type)
        // .set("netwin_rolt_name", request.payload.netwin_rolt_name)
        // .set("current_hub", request.payload.current_hub)
        // .set("future_hub", request.payload.future_hub)

        .set("first_franchise_town", request.payload.first_franchise_town)
        .set("first_hamlet", request.payload.first_hamlet)
        .set("first_street", request.payload.first_street)
        .set("first_cross_street", request.payload.first_cross_street)
        .set("first_utlity_strip_width", request.payload.first_utlity_strip_width)
        .set("first_lat_long", request.payload.first_lat_long)
        .set("first_riser_pole", request.payload.first_riser_pole)
        .set("first_permitting_agency", request.payload.first_permitting_agency)
        .set("first_road_type", request.payload.first_road_type)
        .set("first_pictures", request.payload.first_pictures)

        // .set("approved_final_location", request.payload.approved_final_location)
        // .set("permit__", request.payload.permit__)
        // .set("blocked_y_n_", request.payload.blocked_y_n_)
        // .set("blocked_by", request.payload.blocked_by)
        // .set("blocker_owner", request.payload.blocker_owner)
        // .set("eta_blocker_resolution", request.payload.eta_blocker_resolution)
        // .set("blocker_description", request.payload.blocker_description)

        .where("id =" + request.params.id);

    console.log(sql.toString());
    return sql.toString();
}

module.exports = [{
    method: 'POST',
    path: '/update_permitting_table_first_location/v1/{table},{permitting_rolt_number},{id}',
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
                // rolt_status: Joi.string().description("What Column"),
                // cabinet_type: Joi.string().description("What Column"),
                // netwin_rolt_name: Joi.string().description("What Column"),
                // current_hub: Joi.string().description("What Column"),
                // future_hub: Joi.string().description("What Column"),

                first_franchise_town: Joi.string().description("First Franchise"),
                first_hamlet: Joi.string().description("First Hamlet"),
                first_street: Joi.string().description("First Street"),
                first_cross_street: Joi.string().description("First Cross Street"),
                first_utlity_strip_width: Joi.string().replace(/'/g, "''").description("First Utility Strip Width"),// THIS COLUMN HAS A SINGLE QUOTE IN THE FIELD SO IT SCREWS EVERTHING Up
                first_lat_long: Joi.string().description("first Lat Long"),
                first_riser_pole: Joi.string().description("First Riser Pole"),
                first_permitting_agency: Joi.string().description("First Permitting Agency"),
                first_road_type: Joi.string().description("First Road Type"),
                first_pictures: Joi.string().description("First Pictures"),


                // approved_final_location: Joi.string().description("What Column"),
                // permit__: Joi.string().description("What Column"),
                // blocked_y_n_: Joi.string().description("What Column"),
                // blocked_by: Joi.string().description("What Column"),
                // blocker_owner: Joi.string().description("What Column"),
                // eta_blocker_resolution: Joi.string().description("What Column"),
                // blocker_description: Joi.string().description("What Column"),

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
