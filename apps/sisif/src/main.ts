var express = require('express');
var app = express();
var Agenda = require('agenda');
var Agendash = require('agendash');

const connectionString = `mongodb://root:${process.env.MONGO_PASSWORD}@sisif-persistance-mongodb:${process.env.SISIF_PERSISTANCE_MONGODB_SERVICE_PORT_MONGODB}/admin`;

var agenda = new Agenda({ db: { address: connectionString } });
// or provide your own mongo client:
// var agenda = new Agenda({mongo: myMongoClient})

app.use('/dash', Agendash(agenda));
app.get('/', (req, res) => res.send('Hello World!'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
