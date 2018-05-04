const config = require('../config');
const db = require('../config/db.js');
const squel = require('squel').useFlavour('postgres');

function formatSQL() {

  return squel
    .select()
    .from('geometry_columns')
    .order('f_table_name')
    .toString();
}

module.exports = [
  {
    method: 'GET',
    path: '/list_layers/v1',
    config: {
      description: 'list layers',
      notes: 'Returns a list of tables with geometry columns.',
      tags: ['api'],
      jsonp: 'callback',
      cache: config.cache
    },
    handler: function(request, reply) {
      db
        .any(formatSQL(request))
        .then(function(data) {
          reply(data);
        })
        .catch(function(err) {
          reply({
            error: 'error running query',
            error_details: err
          });
        });
    }
  }
];