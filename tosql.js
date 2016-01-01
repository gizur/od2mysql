/*

Example of input:

{"queryType":"create_account","admin_op":true,"bucket_op":false,"user":"accountid","password":"password"}{"email":"joe@example.com"}
{"queryType":"reset_password","schema":"accountid","admin_op":true,"bucket_op":false,"user":"accountid","password":"password"}{"accountId":"accountid","email":"joe@example.com"}
{"queryType":"create_table","schema":"accountid","admin_op":true,"bucket_op":false,"user":"accountid","password":"password"}{"tableDef":{"tableName":"mytable","columns":["col1 int","col2 varchar(255)"]}}
{"queryType":"insert","schema":"accountid","table":"mytable","admin_op":false,"bucket_op":false,"user":"accountid","password":"password"}insert into accountid.mytable(col1,col2) values(22,"22");
{"queryType":"select","schema":"accountid","table":"mytable","sql":"select * from accountid.mytable","admin_op":false,"bucket_op":false,"user":"accountid","password":"password"}
{"queryType":"update","schema":"accountid","table":"mytable","admin_op":false,"bucket_op":false,"user":"accountid","password":"password"}update accountid.mytable set col2=33;
{"queryType":"grant","schema":"accountid","admin_op":true,"bucket_op":false,"user":"accountid","password":"password"}{"tableName":"mytable","accountId":"accountid"}
{"queryType":"revoke","schema":"accountid","admin_op":true,"bucket_op":false,"user":"accountid","password":"password"}{"tableName":"mytable","accountId":"accountid"}
{"queryType":"delete","schema":"accountid","table":"mytable","sql":" where col1 = 22","admin_op":false,"bucket_op":false,"user":"accountid","password":"password"}{"tableName":"mytable","accountId":"accountid"}
{"queryType":"metadata","schema":"accountid","table":"mytable","admin_op":false,"bucket_op":false,"user":"accountid","password":"password"}
false{"name":"b_mybucket"}
{"queryType":"create_bucket","schema":"accountid","admin_op":false,"bucket_op":false,"user":"accountid","password":"password"}{"name":"b_mybucket"}
{"queryType":"insert","schema":"accountid","table":"b_mybucket","admin_op":false,"bucket_op":true,"user":"accountid","password":"password"}Some data to write to the bucket...
{"queryType":"select","schema":"accountid","table":"b_mybucket","sql":"select * from accountid.b_mybucket","admin_op":false,"bucket_op":true,"user":"accountid","password":"password"}
{"queryType":"drop_bucket","schema":"accountid","admin_op":false,"bucket_op":false,"user":"accountid","password":"password"}{"name":"b_mybucket"}
{"queryType":"delete_account","schema":"accountid","admin_op":true,"bucket_op":false,"user":"accountid","password":"password"}{"email":"joe@example.com"}

*/


var crypto = require('crypto');

var log = console.log.bind(console);

// Documentation of the hash function used is found here:
// http://nodejs.org/api/crypto.html
var ACCOUNT_ID = {

  // a secret salt used when generating the account ids
  // can for instance be generated like this: `openssl rand -base64 32`
  SECRET_SALT: 'MnS3FQfXIbtMrvT6Y1zboNHLkiX/hui0NVqcR33EoQs=',

  // Algorithm used to create account ids. 'sha1', 'md5', 'sha256', 'sha512',
  // etc. `openssl list-message-digest-algorithms` will display the available
  // digest algorithms
  HASH_ALG: 'sha1',

  // 'utf8', 'ascii' or 'binary'
  HASH_ENCODING: 'hex'
};

var email2accountId = function (email) {
  var hashSum = crypto.createHash(ACCOUNT_ID.HASH_ALG);
  hashSum.update(ACCOUNT_ID.SECRET_SALT + email);
  return hashSum.digest(ACCOUNT_ID.HASH_ENCODING).slice(0, 12)
};

toSql = function (q, d) {

  var sql;
  log(q);
  switch (q.queryType) {

    case 'create_account':
      var accountId = email2accountId(d.email);
      sql = 'create database ' + accountId + ';';
      sql += "create user '" + accountId + "'@'localhost';";
      sql += "grant all privileges on " + accountId + ".* to '" +
        accountId + "'@'localhost' with grant option;";
      break;

    case 'delete_account':
      sql = "drop user '" + d.accountId + "'@'localhost';";
      sql += 'drop database ' + d.accountId + ';';
      break;

  }

  return sql;

};

module.exports = toSql;
