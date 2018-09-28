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
        .set("aerial", request.payload.aerial)
        .set("ba", request.payload.ba)
        .set("commercial", request.payload.commercial)
        .set("commercial_ug", request.payload.commercial_ug)
        .set("mdu", request.payload.mdu)
        .set("planned", request.payload.planned)
        .set("ug", request.payload.ug)
        .set("total", request.payload.total)
        .where("id =" + request.query.id);

    console.log(sql.toString())
    return sql.toString();
}

module.exports = [
    {
        method: 'POST',
        path: '/update_homes_passed/v1/{table}',

        config: {
            auth: 'simple',
            description: 'Update Homes Passed',
            notes: 'Update Homes Passed Table',
            tags: ['api'],
            validate: {
                params: {
                    table: Joi.string()
                        .required()
                        .description('Table Name').default('ftth.homes_passed'),
                },
                query: {
                    id: Joi.number().integer().description('The ID for the Feature')
                },
                payload: {
                    aerial: Joi.string().allow('').description('Region'),
                    ba: Joi.string().allow('').description('Region'),
                    commercial: Joi.string().allow('').description('Region'),
                    commercial_ug: Joi.string().allow('').description('Region'),
                    mdu: Joi.string().allow('').description('Region'),
                    planned: Joi.string().allow('').description('Region'),
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
                        reply("Successful");
                    })
                    .catch(function (err) {
                        reply(err.detail, console.log(err));
                    });
            },
        },
    },
];
