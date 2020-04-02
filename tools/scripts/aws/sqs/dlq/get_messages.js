/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/promise-function-async */

// const AWS = require('aws-sdk');

const fs = require('fs');
const shell = require('shelljs');

const receiveMessagesCommand = `aws --profile=production sqs receive-message --queue-url https://sqs.eu-west-1.amazonaws.com/918602980697/prod-invoicing-queue-DLQ --attribute-names All --message-attribute-names All --max-number-of-messages 10
`;
const deleteMessagesCommand = `aws --profile=production sqs delete-message-batch --queue-url https://sqs.eu-west-1.amazonaws.com/918602980697/prod-invoicing-queue-DLQ --entries file://delete-message-batch.json
`;

function exec(command, options = { silent: true }) {
  const commandPrefix = ''; // `aws stepfunctions --endpoint http://localhost:${PORT}`;
  return new Promise((res, rej) => {
    shell.exec(`${commandPrefix} ${command}`, options, (code, out, err) => {
      if (err) {
        rej(err);
      }
      res(out ? JSON.parse(out.trim()) : null);
    });
  });
}

const main = async () => {
  const json = await exec(receiveMessagesCommand);
  const entries = [];

  const events = json.Messages.reduce((acc, m) => {
    const body = JSON.parse(m.Body);
    const data = JSON.parse(body.Message);
    const event = data.event.split(':').pop();

    entries.push({
      Id: m.MessageId,
      ReceiptHandle: m.ReceiptHandle,
    });

    acc.push({
      event,
      data,
      timestamp: data.timestamp,
      submissionId: data.data.submissionId,
    });
    return acc;
  }, []);

  fs.appendFileSync('./failedEvents.json', JSON.stringify(events));
  fs.writeFileSync('./delete-message-batch.json', JSON.stringify(entries));

  const deleteBatch = await exec(deleteMessagesCommand);
  if (
    deleteBatch &&
    deleteBatch.Successful &&
    deleteBatch.Successful.length !== entries.length
  ) {
    throw new Error(
      `Failed to delete messages for entries: ${JSON.stringify(entries)}`
    );
  }

  return events;
};

(async () => {
  let runningEvents = await main();

  while (runningEvents.length) {
    runningEvents = await main();
  }
})();
