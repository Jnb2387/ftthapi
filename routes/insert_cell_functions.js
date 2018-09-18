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
    // .set("object_id", request.payload['data[0][object_id]'])
    .set("design_function", request.payload.design_function)
    .set("resource", request.payload.resource)
    .set("date_complete", request.payload.date_complete)
    .set("comment", request.payload.comment)

  console.log(sql.toString())
  return sql.toString();
}

module.exports = [
  {
    method: 'POST',
    path: '/insert_functions/v1/{table}',
    config: {
      auth: 'simple',
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
          pni_cell_name: Joi.string().description('PNI Cell Name'),
          netwin_cell_jso_name: Joi.string().description('Netwin Cell JSO Name'),
        },
        payload:{
          design_function:Joi.string().replace(/'/g, "''").description('Design Function'),
          resource:Joi.string().replace(/'/g, "''").description('Resource'),
          date_complete:Joi.string().description('Date Complete'),
          comment:Joi.string().replace(/'/g, "''").allow('').description('Comment'),
        }
      },
      jsonp: 'callback',
      cache: config.cache,
      handler: function (request, reply) {
        //TRY WITh BASIC AUTH 
        const user=request.auth.credentials;
        console.log("Request.Auth.Credentials: ", user)
        if(user.role == "admin"){
             db
          .query(formatSQL(request))
          .then(function (data) {
            //DATATABLES EDITOR EXPECTS A JSON OBJECT TO BE RETURNED WITH THE NEW DATA
            var returndata={"data":[{
              // "function_id":request.payload['data[0][function_id]'],
              // "object_id":request.payload['data[0][object_id]'],

              "current_hub":request.query.current_hub,
              "design_function":request.payload.design_function,
              "resource":request.payload.resource,
              "date_complete":request.payload.date_complete,
              "comment":request.payload.comment,
              "id":request.payload['data[0][id]']
            }]}
            reply(returndata,user);
          })
          .catch(function (err) {
            reply({
              error: 'error running query',
              error_details: err,
            });
          });
        }
        else{
          reply("NO ACCESS")
        }
      },
    },
  },
];
