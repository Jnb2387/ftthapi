var BaseJoi = require('joi'),
    Extension = require('joi-date-extensions'),
    Joi = BaseJoi.extend(Extension),
    squel = require('squel').useFlavour('postgres'),
    config = require('../config'),
    pgp = require('pg-promise')(),
    db = require('../config/db.js');

function formatSQL(request) {
  var sql = squel
    .delete()
    .from(request.params.table)
    .where("id in(" + request.query.id)+")";
  console.log(sql.toString())
  return sql.toString();
}

module.exports = [
  {
    method: 'POST',
     
    path: '/delete_functions/v1/{table}',
    config: {
      auth: 'simple',
      description: 'Delete Function',
      notes: 'Delete Record from Functions Table',
      tags: ['api'],
      validate: {
        params: {
          table: Joi.string()
            .required()
            .description('Table Name').default('ftth.functions_table'),
        },
        query: {
          id: Joi.number().integer().description('The ID for the Feature.'),
        },
      },
      jsonp: 'callback',
      cache: config.cache,
      handler: function (request, reply) {
        db
          .query(formatSQL(request))
          .then(function (data) {
           let returndata = {"data":[{"message":"Row Successfully Deleted"}]}//Datatables always wants to be sent JSON data or returned
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
