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
    .set("cell", request.payload.cell)
    .set("netwin_project_name", request.payload.netwin_project_name)
    .set("feeder", request.payload.feeder)
    .set("permitting_rolt_number", request.payload.permitting_rolt_number)
    .set("town", request.payload.town)
    .set("franchise", request.payload.franchise)
    .set("region", request.payload.region)
    .set("map_number", request.payload.map_number)
    .set("nodes_within_cell", request.payload.nodes_within_cell)
    .set("cell_rfs_date", request.payload.cell_rfs_date)
    .set("homes_serviceable", request.payload.homes_serviceable)
    .set("remaining_homes_unserviceable", request.payload.remaining_homes_unserviceable)
    .set("jso_street_location", request.payload.jso_street_location)
    .set("jso_pole_number", request.payload.jso_pole_number)
    .set("jso_latitude", request.payload.jso_latitude)
    .set("jso_longitude", request.payload.jso_longitude)
    .set("cell_build_year", request.payload.cell_build_year)
    .set("market_year", request.payload.market_year)
    .set("jso_type", request.payload.jso_type)
    .set("cell_dc", request.payload.cell_dc)
    .set("dc_to_location", request.payload.dc_to_location)
    .set("dc_from_location", request.payload.dc_from_location)
    .set("cell_local_design_priority", request.payload.cell_local_design_priority)
    .set("cell_revision_comment", request.payload.cell_revision_comment)
    .set("cell_homes_pocketed", request.payload.cell_homes_pocketed)
    .set("cell_status", request.payload.cell_status)
    .set("number_of_pdos", request.payload.number_of_pdos)
  console.log(sql.toString(),"\n")
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
          netwin_cell_jso_name:Joi.string().description('Netwin Cell JSO Name'),//CANT BE BLANK
          pni_cell_name: Joi.string().description('PNI Cell Name'),//CANT BE BLANK
          cell_state:Joi.string().allow('').description('Cell State'),
          cell_hub:Joi.string().allow('').description('Cell Hub'),
          cell_ring:Joi.string().allow('').description('Cell Ring'),
          rolt_id:Joi.string().allow('').description('Rolt ID'),
          cell:Joi.string().allow('').description('Cell'),
          netwin_project_name:Joi.string().allow('').description('Newtin Project Name'),
          feeder:Joi.string().allow('').description('Feeder'),
          permitting_rolt_number:Joi.string().allow('').description('Permitting Rolt Number'),
          town:Joi.string().allow('').description('Town'),
          region:Joi.string().allow('').description('Region'),
          franchise:Joi.string().allow('').description('Franchise'),
          map_number:Joi.string().allow('').description('Map Number'),
          nodes_within_cell:Joi.string().allow('').description('Nodes Within Cell'),
          cell_rfs_date:Joi.string().allow('').description('Region'),
          homes_serviceable:Joi.string().allow('').description('Region'),
          remaining_homes_unserviceable:Joi.string().allow('').description('Region'),
          jso_street_location:Joi.string().allow('').description('Region'),
          jso_pole_number:Joi.string().allow('').description('Region'),
          jso_latitude:Joi.string().allow('').description('Region'),
          jso_longitude:Joi.string().allow('').description('Region'),
          cell_build_year:Joi.string().allow('').description('Region'),
          market_year:Joi.string().allow('').description('Region'),
          jso_type:Joi.string().allow('').description('Region'),
          cell_dc:Joi.string().allow('').description('Region'),
          dc_to_location:Joi.string().allow('').description('Region'),
          dc_from_location:Joi.string().allow('').description('Region'),
          cell_local_design_priority:Joi.string().allow('').description('Region'),
          cell_revision_comment:Joi.string().allow('').description('Region'),
          cell_homes_pocketed:Joi.string().allow('').description('Region'),
          cell_status:Joi.string().allow('').description('Region'),
          number_of_pdos:Joi.string().allow('').description('Region'),
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
