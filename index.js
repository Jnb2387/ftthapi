const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Router = require('hapi-router');
const config = require('./config');
const Basic = require('hapi-auth-basic');
const Bcrypt = require('bcrypt');
const db = require('./config/db.js');
const Users = require('./config/users');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: '0.0.0.0'|| localhost,
  port: config.port,
  routes: {
    cors: true
  }
});

var validate = function (request, username, password, callback) {
  var user = Users[username];
  if (!user) {
    // console.log("NO USER")
    return {
      credentials: null,
      isValid: false
    };
  }
  Bcrypt.compare(password, user.password, function (err, isValid) {
    // isValid=false;
    callback(err, isValid, {
      id: user.id,
      name: user.name,
      role: user.role
    });
    // console.log("User from bcrypt: ", "Name: ",user.name, ", User Role: ", user.role);
    // console.log("isValid = ",isValid)
  });
};

//FOR AUTHENTICATION NOT SURE WHAT I AM DOING 
server.register(Basic);
server.auth.strategy('simple', 'basic', {
  validateFunc: validate,
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
          title: 'REST API',
          description: 'Created For Ftth',
        }
      }
    }
  ],
  function (err) {
    server.start(function () {
      // Add any server.route() config here
      console.log('Server running at:', server.info.uri);
    });
  }
);


//  THIS DEFINATELY NEEDS TO BE CHECKED
//  IT SENDS THE HTML FROM THE SERVER
 server.route({
  method : 'GET',
  path : '/{param*}',
   config: {
      auth: 'simple',
    },
  handler : {
        directory : {
          path : 'public'
      }

  }
});
 //  THIS DEFINATELY NEEDS TO BE CHECKED
//  IT SENDS THE HTML FROM THE SERVER
 server.route({
  method : 'POST',
  path : '/index.html',
   config: {
      auth: 'simple',
    },
  handler: function (request, reply) {
      //TRY WITh BASIC AUTH 
        const user=request.auth.credentials;
        console.log("Request.Auth.Credentials: ", user)

        reply(user)
    }
});


 server.route({
    method: 'GET',
    path: '/logout',
    handler: function (request, reply) {
      //TRY WITh BASIC AUTH 
        // const user=request.auth.credentials;
        // console.log("Request.Auth.Credentials: ", user)

        reply('You are logged out now').code(401);
    }
});