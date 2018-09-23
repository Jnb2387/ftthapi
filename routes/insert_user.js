var BaseJoi = require('joi'),
    Extension = require('joi-date-extensions'),
    Joi = BaseJoi.extend(Extension),
    squel = require('squel').useFlavour('postgres'),
    config = require('../config'),
    pgp = require('pg-promise')(),
    Bcrypt = require('bcrypt'),
    db = require('../config/db.js');

function formatSQL(request) {
    //ENCRYPT THE PASSWORD BEFORE STORING IT.
    let hash = Bcrypt.hashSync(request.payload.newuserpassword, 10);
    var sql = squel
        .insert()
        .into('ftth.users')
        .set("fullname", request.payload.newuserfullname)
        .set("password", hash)
        .set("role", request.payload.newuserrole)
        .set("username", request.payload.newusername);

    console.log(sql.toString());
    return sql.toString();
}

module.exports = [{
    method: 'POST',
    path: '/insert_user',

    config: {
        //   auth: 'simple',
        description: 'Insert User',
        notes: 'Insert a New User',
        tags: ['api'],
        validate: {
            // params: {
            //   table: Joi.string()
            //     // .required()
            //     .description('Table Name').default('ftth.users'),
            // },
            payload: {
                newuserfullname: Joi.string().required().description("User's Full Name"),
                newuserpassword: Joi.string().required().description("User's Password"),
                newuserrole: Joi.string().required().description("User's Role"),
                newusername: Joi.string().required().description("User's Username"),
            },
        },
        jsonp: 'callback',
        cache: config.cache,
        handler: function (request, h) {
            db
                .query(formatSQL(request))
                .then(function (data) {
                    return h.file('public/index.html')
                })
                .catch(function (err) {
                    console.log(err.detail);
                });
        },
    },
}, ];