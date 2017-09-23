var pbkdf2 = require('pbkdf2');
var crypto = require('crypto');

var knex = require('knex')({
    client: 'mysql',
    connection: {
      host     : 'dbaddr',
      user     : 'dbuser',
      password : 'dbpass',
      database : 'dbname',
      charset  : 'utf8'
    }
});
  
var bookshelf = require('bookshelf')(knex);

var User = bookshelf.Model.extend({
    tableName: 'users'
});

var ACL = bookshelf.Model.extend({
    tableName: 'acls'
});

function addMosquittoUser(username_, pw_)
{
    User.forge(
        {username : username_, pw : ConvertToPBKDF2(pw_)}
    ).save()
    .then(function (user) {
      console.log(user.get('id'));
    })
    .catch(function (err) {
      console.log(err.message);
    });
}

function addMosquittoTopic(username_, topic_, permission_)
{
    ACL.forge(
        {username : username_, topic : topic_, rw : permission_}
    ).save()
    .then(function (acl) {
      console.log(acl.get('id'));
    })
    .catch(function (err) {
      console.log(err.message);
    });
}

function ConvertToPBKDF2(password)
{
    var config = {
        hashBytes: 24,
        saltBytes: 12,
        iterations: 901,
        algorithm: 'sha256'
    };
    var bytes = crypto.randomBytes(config.saltBytes);
    var salt = new Buffer(bytes);
    var derivedKey = pbkdf2.pbkdf2Sync(password, salt.toString('base64'), config.iterations, config.hashBytes, config.algorithm);

    return "PBKDF2$" + config.algorithm + "$" + config.iterations + "$" + salt.toString('base64') + "$" + derivedKey.toString('base64');
}
