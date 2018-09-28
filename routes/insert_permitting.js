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
    .set("permitting_rolt_number", request.payload.permitting_rolt_number)
    .set("rolt_status", request.payload.rolt_status)
    .set("cabinet_type", request.payload.cabinet_type)
    .set("netwin_rolt_name", request.payload.netwin_rolt_name)
    .set("current_hub", request.payload.current_hub)
    .set("future_hub", request.payload.future_hub)
    .set("approved_final_location", request.payload.approved_final_location)
    .set("permit_", request.payload.permit_)
    .set("blocked_y_n_", request.payload.blocked_y_n_)
    .set("blocked_by", request.payload.blocked_by)
    .set("blocker_owner", request.payload.blocker_owner)
    .set("eta_blocker_resolution", request.payload.eta_blocker_resolution)
    .set("blocker_description", request.payload.blocker_description)


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
  //NOT ADD IN MODAL YET
  // .set("ga_outreach_completed", request.payload.ga_outreach_completed)
  // .set("municipality_climate", request.payload.municipality_climate)
  // .set("original_build_yr", request.payload.original_build_yr)
  // .set("actual_build_yr", request.payload.actual_build_yr)

  console.log(sql.toString());
  return sql.toString();
}

module.exports = [
  {
    method: 'POST',
    path: '/insert_permitting/v1/{table}',

    config: {
      auth: 'simple',
      description: 'Insert Permitting',
      notes: 'Insert a New Permitting',
      tags: ['api'],
      validate: {
        params: {
          table: Joi.string()
            .required()
            .description('name of the table').default('ftth.permitting'),
        },
        payload: {
          permitting_rolt_number: Joi.string().description('Netwin Cell JSO Name'),
          rolt_status: Joi.string().replace(/'/g, "''").allow('').description('PNI Cell Name'),
          cabinet_type: Joi.string().replace(/'/g, "''").allow('').description('Cabinet Type'),
          netwin_rolt_name: Joi.string().replace(/'/g, "''").allow('').description('Netwin Rolt Name'),
          current_hub: Joi.string().replace(/'/g, "''").allow('').description('Current Hub'),
          approved_final_location: Joi.string().replace(/'/g, "''").allow('').description('Approved Final Location'),
          permit_: Joi.string().replace(/'/g, "''").allow('').description('Permit'),
          blocked_y_n_: Joi.string().replace(/'/g, "''").allow('').description('Blocked By Y N'),
          blocked_by: Joi.string().replace(/'/g, "''").allow('').description('Blocked By'),
          blocker_owner: Joi.string().replace(/'/g, "''").allow('').description('Blocker Owner'),
          eta_blocker_resolution: Joi.string().replace(/'/g, "''").allow('').description('ETA Blocker Resolution'),
          blocker_description: Joi.string().replace(/'/g, "''").allow('').description('Blocker Description'),
          future_hub: Joi.string().replace(/'/g, "''").allow('').description('Future Hub'),
          //NOT ADD IN MODAL YET
          // ga_outreach_completed:Joi.string().allow('').description('GA Outreach Completed'),
          // municipality_climate:Joi.string().allow('').description('Municipality Climate'),
          // original_build_yr:Joi.string().allow('').description('Original Build Year'),
          // actual_build_yr:Joi.string().allow('').description('Actual Build Year'),

          first_franchise_town: Joi.string().replace(/'/g, "''").allow('').description('First Franchise Town'),
          first_hamlet: Joi.string().replace(/'/g, "''").allow('').description('First Hamlet'),
          first_street: Joi.string().replace(/'/g, "''").allow('').description('First Street'),
          first_cross_street: Joi.string().allow('').description('First Cross Street'),
          first_utlity_strip_width: Joi.string().replace(/'/g, "''").allow('').description('First Utility Strip Width'),
          first_lat_long: Joi.string().replace(/'/g, "''").allow('').description('First Lat Long'),
          first_riser_pole: Joi.string().replace(/'/g, "''").allow('').description('First Riser Pole'),
          first_permitting_agency: Joi.string().replace(/'/g, "''").allow('').description('First Permitting Agency'),
          first_road_type: Joi.string().replace(/'/g, "''").allow('').description('First Road Type'),
          first_pictures: Joi.string().replace(/'/g, "''").allow('').description('First Pictures'),

          second_franchise_town: Joi.string().replace(/'/g, "''").allow('').description('Second Franchise Town'),
          second_hamlet: Joi.string().replace(/'/g, "''").allow('').description('Second Hamlet'),
          second_street: Joi.string().replace(/'/g, "''").allow('').description('Second Street'),
          second_cross_street: Joi.string().replace(/'/g, "''").allow('').description('Second Cross Street'),
          second_utility_strip_width: Joi.string().replace(/'/g, "''").allow('').description('Second Utility Strip Width'),
          second_lat_long: Joi.string().replace(/'/g, "''").allow('').description('Second Lat Long'),
          second_riser_pole: Joi.string().replace(/'/g, "''").allow('').description('Second Riser Pole'),
          second_permitting_agency: Joi.string().replace(/'/g, "''").allow('').description('Second Permitting Agency'),
          second_road_type: Joi.string().replace(/'/g, "''").allow('').description('Second Road Type'),
          second_pictures: Joi.string().replace(/'/g, "''").allow('').description('Second Pictures'),

          franchise_town: Joi.string().replace(/'/g, "''").allow('').description('Franchise Town'),
          hamlett: Joi.string().replace(/'/g, "''").allow('').description('Hamlet'),
          street: Joi.string().replace(/'/g, "''").allow('').description('Street'),
          cross_street: Joi.string().replace(/'/g, "''").allow('').description('Cross Street'),
          utility_strip_width: Joi.string().replace(/'/g, "''").allow('').description('Utility Strip Width'),
          lat_long: Joi.string().replace(/'/g, "''").allow('').description('Lat Long'),
          riser_pole: Joi.string().replace(/'/g, "''").allow('').description('Riser Pole'),
          permitting_agency: Joi.string().replace(/'/g, "''").allow('').description('Permitting Agency'),
          road_type: Joi.string().replace(/'/g, "''").allow('').description('Road Type'),
          pictures: Joi.string().replace(/'/g, "''").allow('').description('Picture')
        },
      },
      jsonp: 'callback',
      cache: config.cache,
      handler: function (request, reply) {
        db
          .query(formatSQL(request))
          .then(function (data) {
            reply("Permitting Successfully Inserted.");
          })
          .catch(function (err) {
            console.log(err)
            reply(err.message);
          });
      },
    },
  },
];
