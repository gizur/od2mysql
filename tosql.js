// imports
// =======

var crypto = require('crypto');


// logging
// =======

var log = console.log.bind(console);
var error = console.error.bind(console);

// the logic
// =========

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

randomString = function (len) {
  try {
    var buf = crypto.randomBytes(256);
    var str = new Buffer(buf).toString('base64');
    return str.slice(0, len);
  } catch (ex) {
    // handle error, most likely are entropy sources drained
    error('Error! ' + ex);
    return null;
  }
};

// q = ast for query, d = data, devMode = boolean (will return password after reset)
var f = function (q, d, devMode) {
  var sql = false;

  switch (q.queryType) {

    case 'create_account':
      var accountId = email2accountId(d.email);
      sql = "select '" + accountId + "' as accountId;";
      sql += 'create database ' + accountId + ';';
      sql += "create user '" + accountId + "'@'localhost';";
      sql += "grant all privileges on " + accountId + ".* to '" +
        accountId + "'@'localhost' with grant option;";
      break;

    case 'delete_account':
      var accountId = email2accountId(d.email);
      sql = "drop user '" + accountId + "'@'localhost';";
      sql += 'drop database ' + accountId + ';';
      break;

    case 'reset_password':
      var password = randomString(12);
      sql = '';
      if (devMode) sql += "select '" + password + "' as password;";
      sql += "set password for '" + d.accountId + "'@'localhost' = password('" +
        password + "');";
      break;

    case 'create_table':
      sql = 'create table ' + d.tableDef.tableName + ' (' +
        d.tableDef.columns.join(',') + ');';
      break;

    case 'delete_table':
      sql = 'drop table ' + d.tableName + ';';
      break;

    case 'insert':
    case 'update':
      if (!q.bucketOp) sql = d;
      else {
        var msg = 'writing to bucket ' + q.schema + '.' + q.table +
          ' with credentials ' + q.user;

        sql = 'insert into ' + q.schema + '.' + q.table + '(id,log) values(2,"' + msg + '");'
      }
      break;

    case 'select':
      sql = q.sql;
      break;

    case 'grant':
      sql = "grant insert, select, update, delete on " + d.tableName +
        " to '" + d.accountId + "'@'localhost';";
      break;

    case 'revoke':
      sql = "revoke insert, select, update, delete on " + d.tableName +
        " from '" + d.accountId + "'@'localhost';";
      break;

    case 'delete':
      sql = 'delete from ' + q.schema + '.' + d.tableName;
      // where clause
      if (q.sql !== undefined) sql += q.sql;
      sql += ';';
      break;

    case 'metadata':
      sql = "select column_name,data_type,is_nullable,numeric_precision,numeric_scale from " +
        "information_schema.columns where table_schema='" + q.schema + "' and table_name='" + q.table + "';";
      break;

    case 'create_bucket':
      sql = 'create table ' + d.name + ' (' + ['id int', 'log varchar(255)'].join(',') + ');';
      break;

    case 'drop_bucket':
      sql = 'drop table ' + d.name + ';';
      break;

    case 'service_def':
      sql = 'select table_name, (data_length+index_length)/1024/1024 as mb ' +
        'from information_schema.tables where table_schema="' + q.schema +
        '"';
      break;
  }

  return sql;

};

// Errors will just be thrown, needs to be handled by the user
toSql = function (q, d, devMode) {
  return f(q, d, devMode);
};

// exports
// =======

module.exports = toSql;
