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
        .set("building_attachment", request.payload.building_attachment)
        .set("cable_bearing_strand", request.payload.cable_bearing_strand)
        .set("mdu", request.payload.mdu)
        .set("slack", request.payload.slack)
        .set("ug", request.payload.ug)
        .set("total", request.payload.total)

    console.log(sql.toString())
    return sql.toString();
}

module.exports = [
    {
        method: 'POST',
        path: '/insert_footages/v1/{table}',
        config: {
            auth: 'simple',
            description: 'Insert Footages',
            notes: 'Insert Footages',
            tags: ['api'],
            validate: {
                params: {
                    table: Joi.string()
                        .required()
                        .description('Table Name').default('ftth.footages'),
                },
                payload: {
                    netwin_cell_jso_name: Joi.string().replace(/'/g, '"').description('Netwin Cell JSO Name'),//CANT BE BLANK
                    pni_cell_name: Joi.string().replace(/'/g, '"').description('PNI Cell Name'),//CANT BE BLANK
                    building_attachment: Joi.string().allow('').description('Building Attachment'),
                    cable_bearing_strand: Joi.string().allow('').description('Cable Bearing Strand'),
                    mdu: Joi.string().allow('').description('MDU'),
                    slack: Joi.string().allow('').description('Slack'),
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
                        reply("Footages Successfully Inserted.");
                    })
                    .catch(function (err) {
                        reply(err.detail, console.log(err.detail));
                    });
            },
        },
    },
];
