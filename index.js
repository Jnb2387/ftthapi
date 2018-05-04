const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Router = require('hapi-router');
const config = require('./config');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: '0.0.0.0',
  port: config.port,
  routes: {
    cors: true
  }
});

// Start the server
server.register(
  [
    Inert,
    Vision,
    {
      register: Router,
      options: {
        routes: 'routes/*.js'
      }
    },
    {
      register: HapiSwagger,
      options: {
        schemes: config.schemes,
        host: config.host,
        info: {
          title: 'Dirt-Simple PostGIS REST API',
          description: 'Created by Mecklenburg County GIS',
          license: {
            name: 'MIT Licensed - Fork me on Github!',
            url: 'https://github.com/tobinbradley/dirt-simple-postgis-http-api'
          }
        }
      }
    }
  ],
  function(err) {
    server.start(function() {
      // Add any server.route() config here
      console.log('Server running at:', server.info.uri);
    });
  }
);