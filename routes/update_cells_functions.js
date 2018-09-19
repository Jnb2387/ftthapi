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
        //.set("pni_cell_name", request.query.pni_cell_name)
        //.set("netwin_cell_jso_name", request.query.netwin_cell_jso_name)
        // .set("function_id", request.payload['data['+request.query.id+'][function_id]'])
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
    path: '/update_functions/v1/{table}',
    config: {
        description: 'Update the functions table',
        notes: 'Update.',
        tags: ['api'],
        validate: {
            params: {
                table: Joi.string()
                    .required().description('Table Name').default('ftth.functions_table')
            },
            query: {
                pni_cell_name: Joi.string().replace(/'/g, "''").description('PNI Cell Name'),
                netwin_cell_jso_name: Joi.string().replace(/'/g, "''").description("Netwin Cell JSO Name"),
                id: Joi.number().integer().description('The ID for the Feature'),
            },
            payload:{
                design_function: Joi.string().replace(/'/g, "''").description('Design Function'),
                resource: Joi.string().replace(/'/g, "''").description('Resource'),
                date_complete: Joi.date().format('M/DD/YYYY').raw().description('Date Complete'),//date().format('M/DD/YYYY')
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
                    var returndata = {
                        "data": [{
                            // "function_id": request.payload['data['+request.query.id+'][function_id]'],
                            "design_function": request.payload.design_function,
                            "resource": request.payload.resource,
                            // "object_id": request.payload['data['+request.query.id+'][object_id]'],
                            "date_complete": request.payload.date_complete,
                            "comment": request.payload.comment,
                            "id":request.query.id
                        }]
                    }
                    reply(returndata);
                })
                .catch(function (err) {
                    console.log(err)
                    reply({
                        'error': 'error running query',
                        'error_details': err
                    });
                });
        }
    }
}];
