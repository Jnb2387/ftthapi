var BaseJoi = require('joi'),
    Extension = require('joi-date-extensions'),
    Joi = BaseJoi.extend(Extension),
    squel = require('squel').useFlavour('postgres'),
    config = require('../config'),
    pgp = require('pg-promise')(),
    db = require('../config/db.js');

function formatSQL(request) {
    var sql = squel
        .insert()
        .into(request.params.table)
        .set("netwin_cell_jso_name", request.payload.netwin_cell_jso_name)
        .set("pni_cell_name", request.payload.pni_cell_name)
        .set("aerial", request.payload.aerial)
        .set("ba", request.payload.ba)
        .set("commercial", request.payload.commercial)
        .set("commercial_ug", request.payload.commercial_ug)
        .set("mdu", request.payload.mdu)
        .set("planned", request.payload.planned)
        .set("ug", request.payload.ug)
        .set("total", request.payload.total)
    console.log(sql.toString())
    return sql.toString();
}

module.exports = [
    {
        method: 'POST',
        path: '/insert_homes_passed/v1/{table}',
        config: {
            auth: 'simple',
            description: 'Insert Homes Passed',
            notes: 'Insert Homes Passed',
            tags: ['api'],
            validate: {
                params: {
                    table: Joi.string()
                        .required()
                        .description('Table Name').default('ftth.homes_passed'),
                },
                payload: {
                    netwin_cell_jso_name: Joi.string().replace(/'/g, '"').description('Netwin Cell JSO Name'),//CANT BE BLANK
                    pni_cell_name: Joi.string().replace(/'/g, '"').description('PNI Cell Name'),//CANT BE BLANK
                    aerial: Joi.string().allow('').description('Aerial'),
                    ba: Joi.string().allow('').description('BA'),
                    commercial: Joi.string().allow('').description('commercial'),
                    commercial_ug: Joi.string().allow('').description('commercial UG'),
                    mdu: Joi.string().allow('').description('MDU'),
                    planned: Joi.string().allow('').description('Planned'),
                    ug: Joi.string().allow('').description('UG'),
                    total: Joi.string().allow('').description('Total'),
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
                        reply(err.detail, console.log(err.detail));
                    });
            },
        },
    },
];
