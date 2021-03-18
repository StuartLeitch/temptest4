# Invoicing admin

Invoicing admin UI used by the finance team.

# Invoicing graphql

Invoicing graphql backend. Alse includes express endpoints, event listener, erp scheduler, internal scheduling system - sisif, etc.

# Invoicing web

Payment details pages used by users to pay invoices for manuscripts.

# Reporting backend

Reporting backend listens to phenom events and saves them in a database used by Iris.

# Eve - reporting pull historic events

Multi purpose utility app, usecases: pull events from s3 and write them to sqs, pull events from s3 send to rest endpoint, etc.

# Iris - apache-superset server

https://superset.apache.org/

In Greek mythology, Iris (/ˈaɪrɪs/; Greek: Ίρις Ancient Greek: [îːris]) is the personification and goddess of the rainbow and messenger of the gods.

## Deploy instructions
### QA and DEV environment
* `docker build -t 916437579680.dkr.ecr.eu-west-1.amazonaws.com/iris:latest -f apps/iris/Dockerfile .`
* `docker push 916437579680.dkr.ecr.eu-west-1.amazonaws.com/iris:latest`
* `TENANT=hindawi NODE_ENV=qa NAMESPACE=qa CLUSTER=hindawi-dev COMMAND=build-manifests AWS_REGISTRY=916437579680.dkr.ecr.eu-west-1.amazonaws.com CI_COMMIT_SHA=latest AFFECTED_APPS=iris AWS_PROFILE=dev-k8s node dist/apps/invoicing-infrastructure/main.js`
* `kubectl apply -f ./dist-k8s/ --namespace=qa`

# Sisif - job scheduling system

Uses redis as backend to schedule jobs after a delay or by cron.
