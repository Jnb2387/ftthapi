const Joi = require('joi');
const config = require('../config');
const db = require('../config/db.js');
const squel = require('squel').useFlavour('postgres');

function formatSQL(request) {
  var sql = squel
    .insert()
    .into(request.params.table)
    .set("pni_cell_name", request.query.pni_cell_name)
    .set("netwin_cell_jso_name", request.query.netwin_cell_jso_name)
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
    path: '/insert_functions/v1/{table}',

    config: {
      description: 'Insert',
      notes: 'Insert a new record',
      tags: ['api'],
      validate: {
        params: {
          table: Joi.string()
            .required()
            .description('name of the table').default('ftth.functions_table'),
        },
        query: {
          pni_cell_name: Joi.string().description('The fields to return. The default is <em>all fields</em>.'),
          netwin_cell_jso_name: Joi.string().description('The fields to return. The default is <em>all fields</em>.'),
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
              // "function_id":request.payload['data[0][function_id]'],
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
