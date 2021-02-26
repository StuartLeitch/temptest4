# Pacifier

## Environment variables

You need to have the following variables initialized in your environment:

```bash
NETSUITE_REALM=<netsuite account>
NETSUITE_REST_ENDPOINT=<netsuite endpoint>
NETSUITE_CONSUMER_KEY=<netsuite consumer key>
NETSUITE_CONSUMER_SECRET=<netsuite consumer secret>
NETSUITE_TOKEN_ID=<netsuite token ID>
NETSUITE_TOKEN_SECRET=<netsuite token secret>

RECORD_TYPE=<invoice | journalentry | creditmemo | customerpayment | customer>
BATCH_SIZE=<how many records per batch, default is 200>
DELAY=<awaiting time between batches, default is 200>
```

## How to execute?

You can use the following command:

```bash
RECORD_TYPE=invoice BATCH_SIZE=200 DELAY=200 NETSUITE_REALM=6416429_SB1 NETSUITE_REST_ENDPOINT=https://6416429-sb1.suitetalk.api.netsuite.com/services/rest/ NETSUITE_CONSUMER_KEY=233486a11528291efedcf0d56ea9456d151229bd08ee024415e4fa4bfa2a2b01 NETSUITE_CONSUMER_SECRET=bbb55da759e79236d7e18d891bcb86304b956b09a605cade4d51840178b0befd NETSUITE_TOKEN_ID=fba67d6fc2cc41e9f908215b134fa4a43f2e4e57926de7f65ec59e7e98ac2b91 NETSUITE_TOKEN_SECRET=34ba8b3976e175d64d84c72917498ebe72c50b091e8b4242a9a9943b4281ae51 npx ts-node terminator.ts
```

## Data files mapping

The script will lookup for a specific `.csv` file, following the next rules:
* when `RECORD_TYPE=invoice` it will delete the ids from `data/Invoices.csv`
* when `RECORD_TYPE=journalentry` it will delete the ids from `data/Journals.csv`
* when `RECORD_TYPE=creditmemo` it will delete the ids from `data/CreditMemos.csv`
* when `RECORD_TYPE=customer` it will delete the ids from `data/Customers.csv`
* when `RECORD_TYPE=customerpayment` it will delete the ids from `data/Payments.csv`
