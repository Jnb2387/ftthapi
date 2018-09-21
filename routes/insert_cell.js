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
    .set("cell_state", request.payload.cell_state)
    .set("cell_hub", request.payload.cell_hub)
    .set("cell_ring", request.payload.cell_ring)
    .set("rolt_id", request.payload.rolt_id)
    .set("netwin_project_name", request.payload.netwin_project_name)
    .set("feeder", request.payload.feeder)
    .set("permitting_rolt_number", request.payload.permitting_rolt_number)
    .set("town", request.payload.town)
    .set("region", request.payload.region)
    .set("map_number", request.payload.map_number)
    .set("nodes_within_cell", request.payload.nodes_within_cell);

  console.log(sql.toString())
  return sql.toString();
}

module.exports = [
  {
    method: 'POST',
    path: '/insert_cell/v1/{table}',

    config: {
      auth: 'simple',
      description: 'Insert Cell',
      notes: 'Insert a new Cell',
      tags: ['api'],
      validate: {
        params: {
          table: Joi.string()
            .required()
            .description('Table Name').default('ftth.cells'),
        },
        payload: {
          netwin_cell_jso_name:Joi.string().replace(/'/g, '"').description('Netwin Cell JSO Name'),//CANT BE BLANK
          pni_cell_name: Joi.string().replace(/'/g, '"').description('PNI Cell Name'),//CANT BE BLANK
          cell_state:Joi.string().replace(/'/g, '"').allow('').description('Cell State'),
          cell_hub:Joi.string().replace(/'/g, '"').allow('').description('Cell Hub'),
          cell_ring:Joi.string().replace(/'/g, '"').allow('').description('Cell Ring'),
          rolt_id:Joi.string().replace(/'/g, '"').allow('').description('Rolt ID'),
          netwin_project_name:Joi.string().replace(/'/g, '"').allow('').description('Newtin Project Name'),
          feeder:Joi.string().replace(/'/g, '"').allow('').description('Feeder'),
          permitting_rolt_number:Joi.string().replace(/'/g, '"').allow('').description('Permitting Rolt Number'),
          town:Joi.string().replace(/'/g, '"').allow('').description('Town'),
          region:Joi.string().replace(/'/g, '"').allow('').description('Region'),
          map_number:Joi.string().replace(/'/g, '"').allow('').description('Map Number'),
          nodes_within_cell:Joi.string().replace(/'/g, '"').allow('').description('Nodes Within Cell')
        },
      },
      jsonp: 'callback',
      cache: config.cache,
      handler: function (request, reply) {
        db
          .query(formatSQL(request))
          .then(function (data) {
            reply("Cell Successfully Inserted.");
          })
          .catch(function (err) {
            reply(err.detail, console.log(err.detail));
          });
      },
    },
  },
];
