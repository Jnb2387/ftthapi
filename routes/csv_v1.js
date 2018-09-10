const dbgeo = require('dbgeo');
const Joi = require('joi');
const config = require('../config');
const db = require('../config/db.js');
const squel = require('squel').useFlavour('postgres');
const jsonexport = require('jsonexport');

function formatSQL(request) {
  var sql = squel
    .select()
    .from(request.params.table)
    .field(request.query.columns)
    .where(request.query.filter)
    .limit(request.query.limit);
  if (request.query.join) {
    var join = request.query.join.split(';');
    sql.left_join(join[0], null, join[1]);
  }
  if (request.query.join2) {
    var join2 = request.query.join2.split(';');
    sql.left_join(join2[0], null, join2[1]);
  }
console.log(sql.toString())
  return sql.toString();
}

module.exports = [
  {
    method: 'GET',
    path: '/csv/v1/{table}',
    config: {
      description: 'CSV',
      notes: 'Return CSV.',
      tags: ['api'],
      validate: {
        params: {
          table: Joi.string()
            .required()
            .description('Name of the table.'),
        },
        query: {
          columns: Joi.string()
            .default('*')
            .description(
              'Columns to return. The default is <em>all columns</em>.',
            ),
          filter: Joi.string()
            .default('')
            .description('Filtering parameters for a SQL WHERE statement.'),
        
          join: Joi.string().description(
            'A table to join and a join expression separated by a semicolon. Ex: <em>table2;table1.id = table2.id</em>',
          ),
          join2: Joi.string().description(
            'A table to join and a join expression separated by a semicolon. Ex: <em>table2;table1.id = table2.id</em>',
          ),
          limit: Joi.number()
            .integer()
            .max(10000)
            .min(1)
            .default(5000)
            .description(
              'Limit the number of features returned. The default is <em>5000</em>. The max is 10000.',
            ),
        },
      },
      jsonp: 'callback',
      cache: config.cache,
    },
    handler: function(request, reply) {
      db
        .query(formatSQL(request))
        .then(function(data) {
            data.forEach((row) => {
                delete row.geom;
              });
          jsonexport(data, function(err, csv){
              if(err) return console.log(err);
              reply(csv).type('text/csv')
          })
        })
        .catch(function(err) {
          reply({
            error: 'error running query',
            error_details: err,
          });
        });
    },
  },
];
