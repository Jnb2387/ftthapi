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
    .set("permitting_rolt_number", request.query.permitting_rolt_number)
    .set("current_hub", request.query.current_hub)
    .set("design_function", request.payload.design_function)
    .set("resource", request.payload.resource)
    .set("date_complete", request.payload.date_complete)
    .set("comment", request.payload.comment)
    // .set("object_id", request.payload['data[0][object_id]'])
    // .set("function_id", request.payload['data[0][function_id]'])
  console.log(sql.toString())
  return sql.toString();
}

module.exports = [
  {
    method: 'POST',
    path: '/insert_permitting_functions/v1/{table}',

    config: {
       auth: 'simple',
      description: 'Insert a New Permitting Function',
      notes: 'Insert a new Permitting Function',
      tags: ['api'],
      validate: {
        params: {
          table: Joi.string()
            .required()
            .description('name of the table').default('ftth.permitting_functions'),
        },
        query: {
          permitting_rolt_number: Joi.string().description('Permitting Rolt Number'),
          current_hub: Joi.string().description('Current Hub')
        },
        payload:{
          design_function: Joi.string().description('Design Function'),//DROP DOWN
          resource: Joi.string().replace(/'/g, '"').description('Resource'),
          date_complete:Joi.date().format('M/DD/YYYY').raw().description('Date Complete'),//DATE SELECTOR
          comment: Joi.string().replace(/'/g, '"').allow('').description('Comment')
        }
      },
      jsonp: 'callback',
      cache: config.cache,
      handler: function (request, reply) {
        console.log(request.payload)
        db
          .query(formatSQL(request))
          .then(function (data) {
            //DATATABLES EDITOR EXPECTS A JSON OBJECT TO BE RETURNED WITH THE NEW DATA
            var returndata={"data":[{
              // "object_id":request.payload['data[0][object_id]'],
              "permitting_rolt_number":request.query.permitting_rolt_number,
              "current_hub":request.query.current_hub,
              "design_function":request.payload.design_function,
              "resource":request.payload.resource,
              "date_complete":request.payload.date_complete,
              "comment":request.payload.comment,
              "id":request.payload['data[0][id]']
            }]}
            reply(returndata);
          })
          .catch(function (err) {
            reply(
              {
              error: 'error running query',
              error_details: err,
            }
          );
          });
      },
    },
  },
];
