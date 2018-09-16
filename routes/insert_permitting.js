const Joi = require('joi');
const config = require('../config');
const db = require('../config/db.js');
const squel = require('squel').useFlavour('postgres');

function formatSQL(request) {
  var sql = squel
    .insert()
    .into(request.params.table)
    .set("permitting_rolt_number", request.payload.permitting_rolt_number)
    .set("rolt_status", request.payload.rolt_status)
    .set("cabinet_type", request.payload.cabinet_type)
    .set("netwin_rolt_name", request.payload.netwin_rolt_name)
    .set("current_hub", request.payload.current_hub)
    .set("approved_final_location", request.payload.approved_final_location)
    .set("permit_", request.payload.permit__)
    .set("blocked_y_n", request.payload.blocked_y_n_)
    .set("blocked_by", request.payload.blocked_by)
    .set("blocker_owner", request.payload.blocker_owner)
    .set("eta_blocker_resolution", request.payload.eta_blocker_resolution)
    .set("blocker_description", request.payload.blocker_description)
    .set("future_hub", request.payload.future_hub)

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
    .set("pictures", request.payload.first_pictures);

  console.log(sql.toString());
  return sql.toString();
}

module.exports = [
  {
    method: 'POST',
    path: '/insert_permitting/v1/{table}',

    config: {
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
          permitting_rolt_number:Joi.string().description('Netwin Cell JSO Name'),
          rolt_status: Joi.string().allow('').description('PNI Cell Name'),
          cabinet_type:Joi.string().allow('').description('placeholder'),
          netwin_rolt_name:Joi.string().allow('').description('Cell Hub'),
          current_hub:Joi.string().allow('').description('Cell Ring'),
          approved_final_location:Joi.string().allow('').description('placeholder'),
          permit__:Joi.string().allow('').description('placeholder'),
          blocked_y_n_:Joi.string().allow('').description('placeholder'),
          blocked_by:Joi.string().allow('').description('placeholder'),
          blocker_owner:Joi.string().allow('').description('placeholder'),
          eta_blocker_resolution:Joi.string().allow('').description('placeholder'),
          blocker_description:Joi.string().allow('').description('placeholder'),
          future_hub:Joi.string().allow('').description('Rolt ID'),

          first_franchise_town:Joi.string().allow('').description('Newtin Project Name'),
          first_hamlet:Joi.string().allow('').description('Feeder'),
          first_street:Joi.string().allow('').description('Permitting Rolt Number'),
          first_cross_street:Joi.string().allow('').description('Town'),
          first_utlity_strip_width:Joi.string().allow('').description('Region'),
          first_lat_long:Joi.string().allow('').description('Map Number'),
          first_riser_pole:Joi.string().allow('').description('Nodes Within Cell'),
          first_permitting_agency:Joi.string().allow('').description('placeholder'),
          first_road_type:Joi.string().allow('').description('placeholder'),
          first_pictures:Joi.string().allow('').description('placeholder'),

          second_franchise_town:Joi.string().allow('').description('placeholder'),
          second_hamlet:Joi.string().allow('').description('placeholder'),
          second_street:Joi.string().allow('').description('placeholder'),
          second_cross_street:Joi.string().allow('').description('placeholder'),
          second_utility_strip_width:Joi.string().allow('').description('placeholder'),
          second_lat_long:Joi.string().allow('').description('placeholder'),
          second_riser_pole:Joi.string().allow('').description('placeholder'),
          second_permitting_agency:Joi.string().allow('').description('placeholder'),
          second_road_type:Joi.string().allow('').description('placeholder'),
          second_pictures:Joi.string().allow('').description('placeholder'),

          franchise_town:Joi.string().allow('').description('placeholder'),
          hamlett:Joi.string().allow('').description('placeholder'),
          street:Joi.string().allow('').description('placeholder'),
          cross_street:Joi.string().allow('').description('placeholder'),
          utility_strip_width:Joi.string().allow('').description('placeholder'),
          lat_long:Joi.string().allow('').description('placeholder'),
          riser_pole:Joi.string().allow('').description('placeholder'),
          permitting_agency:Joi.string().allow('').description('placeholder'),
          road_type:Joi.string().allow('').description('placeholder'),
          pictures:Joi.string().allow('').description('placeholder')

        },
      },
      jsonp: 'callback',
      cache: config.cache,
      handler: function (request, reply) {
        // console.log(request.payload);
        db
          .query(formatSQL(request))
          .then(function (data) {
            reply("Permitting Successfully Inserted.");
          })
          .catch(function (err) {
            reply(err.detail, console.log(err));
          });
      },
    },
  },
];
