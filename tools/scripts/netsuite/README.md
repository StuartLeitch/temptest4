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
RECORD_TYPE=invoice BATCH_SIZE=200 DELAY=200 NETSUITE_REALM=6416429_SB1 NETSUITE_REST_ENDPOINT=https://6416429-sb1.suitetalk.api.netsuite.com/services/rest/ NETSUITE_CONSUMER_KEY=<consumer key> NETSUITE_CONSUMER_SECRET=<consumer secret> NETSUITE_TOKEN_ID=<token id> NETSUITE_TOKEN_SECRET=<token secret> npx ts-node terminator.ts
```

## Data files mapping

The script will lookup for a specific `.csv` file, following the next rules:

- when `RECORD_TYPE=invoice` it will delete the ids from `data/Invoices.csv`
- when `RECORD_TYPE=journalentry` it will delete the ids from `data/Journals.csv`
- when `RECORD_TYPE=creditmemo` it will delete the ids from `data/CreditMemos.csv`
- when `RECORD_TYPE=customer` it will delete the ids from `data/Customers.csv`
- when `RECORD_TYPE=customerpayment` it will delete the ids from `data/Payments.csv`

## Dockerization

```sh
docker build -t 916437579680.dkr.ecr.eu-west-1.amazonaws.com/dragons-playground:netsuite-pacifier-0.7.0 -f Dockerfile .
```

```sh
docker push 916437579680.dkr.ecr.eu-west-1.amazonaws.com/dragons-playground:netsuite-pacifier-0.7.0
```

## AWS Login

```sh
aws --profile=HindawiDevelopment ecr get-login-password | docker login --username AWS --password-stdin 916437579680.dkr.ecr.eu-west-1.amazonaws.com
```
