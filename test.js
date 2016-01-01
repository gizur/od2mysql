var tosql = require('./tosql.js');

var log = console.log.bind(console);

var q = JSON.parse('{"queryType":"create_account","admin_op":true,"bucket_op":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"email":"joe@example.com"}');
log(q, d);
log(tosql(q, d));