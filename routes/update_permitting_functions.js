var Joi = require('joi'),
    squel = require('squel').useFlavour('postgres'),
    config = require('../config'),
    pgp = require('pg-promise')();
const db = require('../config/db.js');

function formatSQL(request) {

    var sql = squel
        .update()
        .table(request.params.table)
        //.set("permitting_rolt_number", request.query.permitting_rolt_number)
        .set("current_hub", request.query.current_hub)
        // .set("function_id", request.payload['data['+request.query.id+'][function_id]'])
        .set("design_function", request.payload['data['+request.query.id+'][design_function]'])
        .set("resource", request.payload['data['+request.query.id+'][resource]'])
        // .set("object_id", request.payload['data['+request.query.id+'][object_id]'])
        .set("date_complete", request.payload['data['+request.query.id+'][date_complete]'])
        .set("comment", request.payload['data['+request.query.id+'][comment]'])
        .where("id =" + request.query.id);
    console.log(sql.toString());

    return sql.toString();
}

module.exports = [{
    method: 'POST',
    path: '/update_permitting_functions/v1/{table}',
    config: {
        description: 'Update the permitting functions table',
        notes: 'Update permitting function table.',
        tags: ['api'],
        validate: {
            params: {
                table: Joi.string()
                    .required().description('name of the table').default('ftth.permitting_functions')
            },
            query: {
                permitting_rolt_number: Joi.string().description('Permitting Rolt Number'),
                current_hub: Joi.string().description("Current Hub"),
                id: Joi.number().integer().description('The ID for the Feature.'),
            }
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
                        "design_function":request.payload['data['+request.query.id+'][design_function]'],
                        "resource":request.payload['data['+request.query.id+'][resource]'],
                        // "object_id":request.payload['data['+request.query.id+'][object_id]'],
                        "date_complete":request.payload['data['+request.query.id+'][date_complete]'],
                        "comment":request.payload['data['+request.query.id+'][comment]'],
                        "id":request.query.id
          
                      }]}
                    // console.log(returndata)
                    reply(returndata);
                })
                .catch(function (err) {
                    reply({
                        'error': 'error running query',
                        'error_details': err
                    });
                });
        }
    }
}];
