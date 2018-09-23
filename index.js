const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const Router = require('hapi-router');
const config = require('./config');
const Basic = require('hapi-auth-basic');
const Bcrypt = require('bcrypt');
const db = require('./config/db.js');
// const Users = require('./config/users');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: '0.0.0.0' || localhost,
  port: config.port,
  routes: {
    cors: true
  }
});

//THIS FUNCTION TAKES IN THE INPUT FROM THE LOG IN AND RUNS A QUERY TO THE DATABASE CHECKS FOR THE USER NAME AND THEN COMPARES THE ENCRYPTED PASSWORDS
var validate = function (request, username, password, callback) {
  console.log('Validating Request From: ', username);
  db.query("SELECT * FROM ftth.users WHERE (username ILIKE $1)", [username])
    .then(function (data) {
      var user = data[0];
      if (!user) {
        console.log("NO USER");
        return callback(null, false);
      }
      Bcrypt.compare(password, user.password, function (err, isValid) {
        // isValid=true;
        if(err){callback(err)}
        callback(err, isValid, {
          id: user.id,
          name: user.fullname,
          role: user.role
        });
      });
    })
    .catch(function (err) {
      console.log(err)
    });

};

//FOR AUTHENTICATION NOT SURE WHAT I AM DOING 
server.register(Basic);
server.auth.strategy('simple', 'basic', {
  validateFunc: validate,
});
// server.auth.default('simple')

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
  method: 'GET',
  path: '/{param*}', // send any file from the public folder
  handler: {
    directory: {
      path: 'public', // folder to send
      index: ['login.html'] // direct to this page when first loading.
    }
  }
});


//TRY WITh BASIC AUTH
server.route({
  method: 'GET',
  path: '/logout',
  handler: function (request, reply) {
    reply('You are logged out now').code(401); // The code(401) removes the basic auth.
  }
});

//I AM NOT SURE WHY I HAD TO DO THESE
server.route({
  method: 'POST',
  path: '/getuser',
  config: {
    auth: 'simple',
  },
  handler: function (request, reply) {
    //TRY WITh BASIC AUTH 
    const user = request.auth.credentials;
    console.log("Request.Auth.Credentials: ", user);
    reply(user);
  }
});
//THE LOGIN BUTTON SENDS A REQUEST TO THIS ROUTE WHICH IS THE ONLY
server.route({
  method: 'GET',
  path: '/index.html',
  config: {
    auth: 'simple',
  },
  handler: function (request, h) {
    return h.file('public/index.html')
  }
});