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
var f = function (q, d, devMode, dbHost) {
  if (!dbHost) dbHost = '%';

  var sql = false;

  switch (q.queryType) {

    case 'create_account':
      var accountId = email2accountId(d.email);
      sql = "select 'create_account' as queryType, '" + accountId + "' as accountId;";
      sql += 'create database ' + accountId + ';';
      sql += "create user '" + accountId + "'@'" + dbHost + "';";
      sql += "grant all privileges on " + accountId + ".* to '" +
        accountId + "'@'" + dbHost + "' with grant option;";
      sql += "grant all privileges on " + accountId + ".* to '" +
        accountId + "'@'localhost' with grant option;";
      break;

    case 'delete_account':
      var accountId = email2accountId(d.email);
      sql = "select 'delete_account' as queryType;";
      sql += "drop user '" + accountId + "'@'" + dbHost + "';";
      sql += 'drop database ' + accountId + ';';
      break;

    case 'reset_password':
      var password = randomString(12);
      sql = "select 'reset_password' as queryType";
      if (devMode) sql += ", '" + password + "' as password";
      sql += ";set password for '" + d.accountId + "'@'" + dbHost + "' = password('" +
        password + "');";
      sql += "grant all privileges on " + d.accountId + ".* to '" +
        d.accountId + "'@'" + dbHost + "' identified by '" + password + "' with grant option;";
      sql += "grant all privileges on " + d.accountId + ".* to '" +
        d.accountId + "'@'localhost' identified by '" + password + "' with grant option;";
      break;

    case 'create_table':
      sql = "select 'create_table' as queryType;";
      sql += 'create table ' + d.tableDef.tableName + ' (' +
        d.tableDef.columns.join(',') + ');';
      break;

    case 'delete_table':
      sql = "select 'delete_table' as queryType;";
      sql += 'drop table ' + d.tableName + ';';
      break;

    case 'insert':
    case 'update':
      if (q.queryType === 'insert') sql = "select 'insert' as queryType;";
      else sql = "select 'update' as queryType;";
      if (!q.bucketOp) {
        sql += d;
      } else {
        var msg = 'writing to bucket ' + q.schema + '.' + q.table +
          ' with credentials ' + q.user;

        sql += 'insert into ' + q.schema + '.' + q.table + '(id,log) values(2,"' + msg + '");'
      }
      break;

    case 'select':
      sql = "select 'select' as queryType;";
      sql += q.sql;
      break;

    case 'grant':
      sql = "select 'grant' as queryType;";
      sql += "grant insert, select, update, delete on " + q.schema + '.' + d.tableName +
        " to '" + d.accountId + "'@'" + dbHost + "';";
      break;

    case 'revoke':
      sql = "select 'revoke' as queryType;";
      sql += "revoke insert, select, update, delete on " + q.schema + '.' + d.tableName +
        " from '" + d.accountId + "'@'" + dbHost + "';";
      break;

    case 'delete':
      sql = "select 'delete' as queryType;";
      sql += 'delete from ' + q.schema + '.' + q.table;
      // where clause
      if (q.sql !== undefined) sql += q.sql;
      sql += ';';
      break;

    case 'metadata':
      sql = "select 'metadata' as queryType;";
      sql += "select column_name,data_type,is_nullable,numeric_precision,numeric_scale from " +
        "information_schema.columns where table_schema='" + q.schema + "' and table_name='" + q.table + "';";
      break;

    case 'create_bucket':
      sql = "select 'create_bucket' as queryType;";
      sql += 'create table ' + d.name + ' (' + ['id int', 'log varchar(255)'].join(',') + ');';
      break;

    case 'drop_bucket':
      sql = "select 'drop_bucket' as queryType;";
      sql += 'drop table ' + d.name + ';';
      break;

    case 'service_def':
      sql = "select 'service_def' as queryType;";
      sql += 'select table_name, (data_length+index_length)/1024/1024 as mb ' +
        'from information_schema.tables where table_schema="' + q.schema +
        '"';
      break;

    case 'etag':
      sql = "select 'etag' as queryType;";
      sql += q.sql;
      break;
  }

  return sql;

};

// Errors will just be thrown, needs to be handled by the user
toSql = function (q, d, devMode, dbHost) {
  return f(q, d, devMode, dbHost);
};

// exports
// =======

module.exports = toSql;
