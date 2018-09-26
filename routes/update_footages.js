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
        .set("building_attachment", request.payload.building_attachment)
        .set("cable_bearing_strand", request.payload.cable_bearing_strand)
        .set("mdu", request.payload.mdu)
        .set("slack", request.payload.slack)
        .set("ug", request.payload.ug)
        .set("total", request.payload.total)
        .where("id =" + request.query.id);

    console.log(sql.toString())
    return sql.toString();
}

module.exports = [
    {
        method: 'POST',
        path: '/update_footages/v1/{table}',

        config: {
            auth: 'simple',
            description: 'Update Footages',
            notes: 'Update Footages Table',
            tags: ['api'],
            validate: {
                params: {
                    table: Joi.string()
                        .required()
                        .description('Table Name').default('ftth.footages'),
                },
                query: {
                    id: Joi.number().integer().description('The ID for the Feature')
                },
                payload: {
                    building_attachment: Joi.string().allow('').description('Region'),
                    cable_bearing_strand: Joi.string().allow('').description('Region'),
                    mdu: Joi.string().allow('').description('Region'),
                    slack: Joi.string().allow('').description('Region'),
                    ug: Joi.string().allow('').description('Region'),
                    total: Joi.string().allow('').description('Region'),
                },
            },
            jsonp: 'callback',
            cache: config.cache,
            handler: function (request, reply) {
                db
                    .query(formatSQL(request))
                    .then(function (data) {
                        reply("Footages Successfully Updated.");
                    })
                    .catch(function (err) {
                        reply(err.detail, console.log(err));
                    });
            },
        },
    },
];
