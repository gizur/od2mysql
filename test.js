var tosql = require('./tosql.js');
var log = console.log.bind(console);

// Parsing strings into JSON since I'm lazy...

var q = JSON.parse('{"queryType":"create_account","admin_op":true,"bucket_op":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"email":"joe@example.com"}');
log(tosql(q, d));

var q = JSON.parse('{"queryType":"delete_account","schema":"accountid","admin_op":true,"bucket_op":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"email":"joe@example.com"}');
log(tosql(q, d));

var q = JSON.parse('{"queryType":"reset_password","schema":"accountid","admin_op":true,"bucket_op":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"accountId":"accountid","email":"joe@example.com"}');
log(tosql(q, d));




