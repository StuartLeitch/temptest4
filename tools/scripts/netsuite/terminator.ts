const fs = require('fs');
const csvBatch = require('csv-batch');
const axios = require('axios');

import { ConnectionConfig } from './ConnectionConfig';
import { Connection } from './Connection';

const {
  RECORD_TYPE,
  NETSUITE_REALM,
  NETSUITE_REST_ENDPOINT,
  NETSUITE_CONSUMER_KEY,
  NETSUITE_CONSUMER_SECRET,
  NETSUITE_TOKEN_ID,
  NETSUITE_TOKEN_SECRET
} = process.env;

const BATCH_SIZE = process.env.BATCH_SIZE || 200;
const DELAY = process.env.DELAY || 200;

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
const logWithTime = (val) => console.log(new Date().toJSON().substr(11, 12), val);

const configConnection = {
  account: NETSUITE_REALM,
  endpoint: NETSUITE_REST_ENDPOINT,
  consumerKey: NETSUITE_CONSUMER_KEY,
  consumerSecret: NETSUITE_CONSUMER_SECRET,
  tokenId: NETSUITE_TOKEN_ID,
  tokenSecret: NETSUITE_TOKEN_SECRET,
};

const connection = new Connection({
    config: new ConnectionConfig(configConnection),
});
const { config, oauth, token } = connection;

const dataMap = {
  journalentry: 'Journals',
  creditmemo: 'CreditMemos',
  invoice: 'Invoices',
  customer: 'Customers',
  customerpayment: 'Payments',
};

const main = async () => {
  const dataPath = dataMap[RECORD_TYPE];
  const fileStream = await fs.createReadStream(`${__dirname}/data/${dataPath}.csv`);

  const results = await csvBatch(fileStream, {
    header: false,
    batch: false,
  });

  const forLoop = async () => {
    console.log('\n');
    logWithTime('Start');

    while (results.data.length) {
      const batch = results.data.splice(0, Number(BATCH_SIZE));
      await sleep(Number(DELAY)).then(async () => {
        for (const [ref] of batch) {
          try {
              const deleteRevRecOpts = {
                  url: `${config.endpoint}/record/v1/${RECORD_TYPE}/${ref}`,
                  method: 'DELETE',
              };

              await axios({
                ...deleteRevRecOpts,
                headers: {
                  ...oauth.toHeader(oauth.authorize(deleteRevRecOpts, token)),
                },
                data: null,
              });

              logWithTime(ref);
          }
          catch (err) {
              logWithTime(JSON.stringify(err));
          }
        }
      });
    }

    logWithTime('End');
    console.log('\n');
  };

  await forLoop();

  process.exit(0);
};

main();
