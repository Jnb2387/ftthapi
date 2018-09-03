const Joi = require('joi');
const config = require('../config');
const db = require('../config/db.js');
const squel = require('squel').useFlavour('postgres');

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
      description: 'Insert Cell',
      notes: 'Insert a new record',
      tags: ['api'],
      validate: {
        params: {
          table: Joi.string()
            .required()
            .description('name of the table').default('ftth.cells'),
        },
        payload: {
          netwin_cell_jso_name:Joi.string().description('something'),
          pni_cell_name: Joi.string().description('something'),
          cell_state:Joi.string().allow('').description('something'),
          cell_hub:Joi.string().allow('').description('something'),
          cell_ring:Joi.string().allow('').description('something'),
          rolt_id:Joi.string().allow('').description('something'),
          netwin_project_name:Joi.string().allow('').description('something'),
          feeder:Joi.string().allow('').description('something'),
          permitting_rolt_number:Joi.string().allow('').description('something'),
          town:Joi.string().allow('').description('something'),
          region:Joi.string().allow('').description('something'),
          map_number:Joi.string().allow('').description('something'),
          nodes_within_cell:Joi.string().allow('').description('something')

        },
      },
      jsonp: 'callback',
      cache: config.cache,
      handler: function (request, reply) {
        // console.log(request);
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
