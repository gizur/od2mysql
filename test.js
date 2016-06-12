var tosql = require('./tosql.js');
var log = console.log.bind(console);

// Parsing strings into JSON since I'm lazy...

var q = JSON.parse('{"queryType":"create_account","adminOp":true,"bucketOp":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"email":"joe@example.com"}');
log(tosql(q, d));

var q = JSON.parse('{"queryType":"delete_account","schema":"accountid","adminOp":true,"bucketOp":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"email":"joe@example.com"}');
log(tosql(q, d));

var q = JSON.parse('{"queryType":"reset_password","schema":"accountid","adminOp":true,"bucketOp":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"accountId":"accountid","email":"joe@example.com"}');
log(tosql(q, d, true));

var q = JSON.parse('{"queryType":"create_table","schema":"accountid","adminOp":true,"bucketOp":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"tableDef":{"tableName":"mytable","columns":["col1 int","col2 varchar(255)"]}}');
log(tosql(q, d));

var q = JSON.parse('{"queryType":"insert","schema":"accountid","table":"mytable","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
var d = 'insert into accountid.mytable(col1,col2) values(22,"22");';
log(tosql(q, d));

var q = JSON.parse('{"queryType":"select","schema":"accountid","table":"mytable","sql":"select * from accountid.mytable","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
log(tosql(q, null));

var q = JSON.parse('{"queryType":"select","schema":"schema","table":"table","sql":"select col1,col2 from schema.table where co1 = \'help\'   order by col2 limit 10,100","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
log(tosql(q, null));

var q = JSON.parse('{"queryType":"select","schema":"schema","table":"table","sql":"select col1,col2 from schema.table where Price + 5 > 10 order by col2","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
log(tosql(q, null));

var q = JSON.parse('{"queryType":"select","schema":"schema","table":"table","sql":"select * from schema.table order by col2","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
log(tosql(q, null));

var q = JSON.parse('{"queryType":"update","schema":"accountid","table":"mytable","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
var d = 'update accountid.mytable set col2=33;';
log(tosql(q, d));

var q = JSON.parse('{"queryType":"grant","schema":"accountid","adminOp":true,"bucketOp":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"tableName":"mytable","accountId":"accountid"}');
log(tosql(q, d));

var q = JSON.parse('{"queryType":"revoke","schema":"accountid","adminOp":true,"bucketOp":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"tableName":"mytable","accountId":"accountid"}');
log(tosql(q, d));

var q = JSON.parse('{"queryType":"delete","schema":"accountid","table":"mytable","sql":" where col1 = 22","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"tableName":"mytable","accountId":"accountid"}');
log(tosql(q, d));

var q = JSON.parse('{"queryType":"metadata","schema":"accountid","table":"mytable","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
log(tosql(q, null));

var q = JSON.parse('{"queryType":"create_bucket","schema":"accountid","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"name":"b_mybucket"}');
log(tosql(q, d));

var q = JSON.parse('{"queryType":"insert","schema":"accountid","table":"b_mybucket","adminOp":false,"bucketOp":true,"user":"accountid","password":"password"}');
var d = 'Some data to write to the bucket...';
log(tosql(q, d));

var q = JSON.parse('{"queryType":"select","schema":"accountid","table":"b_mybucket","sql":"select * from accountid.b_mybucket","adminOp":false,"bucketOp":true,"user":"accountid","password":"password"}');
log(tosql(q, null));

var q = JSON.parse('{"queryType":"delete_table","schema":"accountid","adminOp":true,"bucketOp":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"tableName":"mytable"}');
log(tosql(q, d));

var q = JSON.parse('{"queryType":"service_def","schema":"accountid","adminOp":true,"bucketOp":false,"user":"accountid","password":"password"}');var d = JSON.parse('{"tableName":"mytable"}');
log(tosql(q, null));

var q = JSON.parse('{"queryType":"etag","schema":"schema","table":"table","sql":"select col1,col2 from schema.table where Price + 5 > 10 order by col2","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
log(tosql(q, null));

var q = JSON.parse('{"queryType":"exec","schema":"schema","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"procedure":"spMyStoredProcedure","params":[1,2]}');
log(tosql(q, d));

var q = JSON.parse('{"queryType":"cmd","schema":"schema","adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
var d = JSON.parse('{"cmd":"create view vwTest as select * from Test;"}');
log(tosql(q, d));

var q = JSON.parse('{"queryType":"select","schema":"schema","table":"table","etagCols":["col1","col2"],"sql":"select * from schema.table where co1 = \'help\' order by col2 limit 10,100","debug":true,"adminOp":false,"bucketOp":false,"user":"accountid","password":"password"}');
log(tosql(q, null));
