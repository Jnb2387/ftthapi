const Joi = require('joi');
const config = require('../config');
const db = require('../config/db.js');
const squel = require('squel').useFlavour('postgres');

function formatSQL(request) {
  var sql = squel
    .insert()
    .into(request.params.table)
    .set("permitting_rolt_number", request.query.permitting_rolt_number)
    .set("current_hub", request.query.current_hub)
    // .set("function_id", request.payload['data[0][function_id]'])
    .set("design_function", request.payload['data[0][design_function]'])
    .set("resource", request.payload['data[0][resource]'])
    // .set("object_id", request.payload['data[0][object_id]'])
    .set("date_complete", request.payload['data[0][date_complete]'])
    .set("comment", request.payload['data[0][comment]'])
  console.log(sql.toString())
  return sql.toString();
}

module.exports = [
  {
    method: 'POST',
    path: '/insert_permitting_functions/v1/{table}',

    config: {
      description: 'Insert a New Function',
      notes: 'Insert a new Function',
      tags: ['api'],
      validate: {
        params: {
          table: Joi.string()
            .required()
            .description('name of the table').default('ftth.functions_table'),
        },
        query: {
          permitting_rolt_number: Joi.string().description('The fields to return. The default is <em>all fields</em>.'),
          current_hub: Joi.string().description('The fields to return. The default is <em>all fields</em>.'),
          // design_function:Joi.string().allow('').description('something'),
          // resource:Joi.string().allow('').description('something'),
          // date_complete:Joi.string().allow('').description('something'),
          // comment:Joi.string().allow('').description('something'),
          // id:Joi.string().description('something')
        },
      },
      jsonp: 'callback',
      cache: config.cache,
      handler: function (request, reply) {
        db
          .query(formatSQL(request))
          .then(function (data) {
            //DATATABLES EDITOR EXPECTS A JSON OBJECT TO BE RETURNED WITH THE NEW DATA
            var returndata={"data":[{
              "permitting_rolt_number":request.query.permitting_rolt_number,
              "current_hub":request.query.current_hub,
              "design_function":request.payload['data[0][design_function]'],
              "resource":request.payload['data[0][resource]'],
              // "object_id":request.payload['data[0][object_id]'],
              "date_complete":request.payload['data[0][date_complete]'],
              "comment":request.payload['data[0][comment]'],
              "id":request.payload['data[0][id]']

            }]}
            reply(returndata);
          })
          .catch(function (err) {
            reply({
              error: 'error running query',
              error_details: err,
            });
          });
      },
    },
  },
];
