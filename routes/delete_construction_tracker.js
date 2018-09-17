const Joi = require('joi');
const config = require('../config');
const db = require('../config/db.js');
const squel = require('squel').useFlavour('postgres');

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
    path: '/delete_construction_tracker/v1/{table}',
    config: {
        // auth: 'simple',
      description: 'Delete Permitting Function',
      notes: 'Delete Record from Permitting Functions Table',
      tags: ['api'],
      validate: {
        params: {
          table: Joi.string()
            .required()
            .description('name of the table').default('ftth.construction_cell_tracker'),
        },
        query: {
          id: Joi.number().integer().description('The ID for edit point.'),
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
