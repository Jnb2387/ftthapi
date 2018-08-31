var Joi = require('joi'),
    squel = require('squel').useFlavour('postgres'),
    config = require('../config'),
    pgp = require('pg-promise')();
const db = require('../config/db.js');

function formatSQL(request) {

    var sql = squel
        .update()
        .table(request.params.table)
        .set("pni_cell_name", request.query.pni_cell_name)
        .set("netwin_cell_jso_name", request.query.netwin_cell_jso_name)
        .set("function_id", request.payload['data['+request.query.id+'][function_id]'])
        .set("design_function", request.payload['data['+request.query.id+'][design_function]'])
        .set("resource", request.payload['data['+request.query.id+'][resource]'])
        .set("object_id", request.payload['data['+request.query.id+'][object_id]'])
        .set("date_complete", request.payload['data['+request.query.id+'][date_complete]'])
        .set("comment", request.payload['data['+request.query.id+'][comment]'])
        // .set("geom", 'ST_SetSRID(ST_MakePoint('+request.query.geom +'),4326)', {
        //     dontQuote: true
        // })
        .where("id =" + request.query.id);
    console.log(sql.toString());

    return sql.toString();
}

module.exports = [{
    method: 'POST',
    path: '/update_functions/v1/{table}',
    config: {
        description: 'Update the functions table',
        notes: 'Update.',
        tags: ['api'],
        validate: {
            params: {
                table: Joi.string()
                    .required().description('name of the table').default('ftth.functions_table')
            },
            query: {
                pni_cell_name: Joi.string().description('The fields to return. The default is <em>all fields</em>.'),
                netwin_cell_jso_name: Joi.string().description("What Column"),
                id: Joi.number().integer().description('The ID for edit point.'),
            }
        },
        jsonp: 'callback',
        cache: config.cache,
        handler: function (request, reply) {
            db
                .query(formatSQL(request))
                .then(function (data) {
                    //DATATABLES EDITOR EXPECTS A JSON OBJECT TO BE RETURNED WITH THE NEW DATA
                    var returndata = {
                        "data": [{
                            "function_id": request.payload['data['+request.query.id+'][function_id]'],
                            "design_function": request.payload['data['+request.query.id+'][design_function]'],
                            "resource": request.payload['data['+request.query.id+'][resource]'],
                            "object_id": request.payload['data['+request.query.id+'][object_id]'],
                            "date_complete": request.payload['data['+request.query.id+'][date_complete]'],
                            "comment": request.payload['data['+request.query.id+'][comment]'],
                            "id":request.query.id
                        }]
                    }
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
