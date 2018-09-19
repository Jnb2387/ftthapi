var BaseJoi = require('joi'),
    Extension = require('joi-date-extensions'),
    Joi = BaseJoi.extend(Extension),
    squel = require('squel').useFlavour('postgres'),
    config = require('../config'),
    pgp = require('pg-promise')(),
    db = require('../config/db.js');

function formatSQL(request) {
    var sql = squel
        .update()
        .table(request.params.table)
        //.set("permitting_rolt_number", request.query.permitting_rolt_number)
        // .set("function_id", request.payload['data['+request.query.id+'][function_id]'])
        // .set("object_id", request.payload['data['+request.query.id+'][object_id]'])
        .set("current_hub", request.query.current_hub)
        .set("design_function", request.payload.design_function)
        .set("resource", request.payload.resource)
        .set("date_complete", request.payload.date_complete)
        .set("comment", request.payload.comment)

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
                    .required().description('Table Name').default('ftth.permitting_functions')
            },
            query: {
                permitting_rolt_number: Joi.string().description('Permitting Rolt Number'),
                current_hub: Joi.string().description("Current Hub"),
                id: Joi.number().integer().description('The ID for the Feature.'),
            },
             payload:{
                design_function: Joi.string().replace(/'/g, "''").description('Design Function'),
                resource: Joi.string().replace(/'/g, "''").description('Resource'),
                date_complete: Joi.date().format('M/DD/YYYY').raw().description('Date Complete'),
                comment: Joi.string().replace(/'/g, "''").allow('').description('Comment')
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
                        "design_function": request.payload.design_function,
                        "resource": request.payload.resource,
                        // "object_id": request.payload['data['+request.query.id+'][object_id]'],
                        "date_complete": request.payload.date_complete,
                        "comment": request.payload.comment,
                        "id":request.query.id
                      }]}
                    reply(returndata);
                })
                .catch(function (err) {
                    console.log(err);
                    reply({
                        'error': 'error running query',
                        'error_details': err
                    });
                });
        }
    }
}];
