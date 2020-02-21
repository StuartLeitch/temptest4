var express = require('express');
var app = express();
var Agenda = require('agenda');
var Agendash = require('agendash');

const connectionString = `mongodb://root:${process.env.MONGO_PASSWORD}@sisif-persistance-mongodb:${process.env.SISIF_PERSISTANCE_MONGODB_SERVICE_PORT_MONGODB}/admin`;
console.log(connectionString);
var agenda = new Agenda({ db: { address: connectionString } });
agenda.define('log', async job => {
  console.log(job.attrs.data);
});
(async function() {
  // IIFE to give access to async/await
  await agenda.start();

  // agenda.every('10 seconds', 'log', { to: 'admin@example.com' });
})();
// or provide your own mongo client:
// var agenda = new Agenda({mongo: myMongoClient})

app.use('/dash', Agendash(agenda));
app.get('/', (req, res) => res.send('Hello World!'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
