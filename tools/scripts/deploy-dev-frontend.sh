#!/bin/sh

# AWS_SNS_SQS_ACCESS_KEY=AKIAXHH4XI2G67H4L2RE AWS_SNS_SQS_SECRET_KEY=U0AsyIfhG2JLSLLvbH6IUzsWX9v4h8HmXZzoC7o DB_PASSWORD=Vnc2etyLoFaeg39 AWS_SES_ACCESS_KEY=AKIAIGOL6SNQYTP2HWNA AWS_SES_SECRET_KEY=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 AWS_SES_REGION=eu-west-1 BT_MERCHANT_ID=q867bfty9983kzbj BT_PRIVATE_KEY=525102f862711c6614a0274b4913c96e BT_PUBLIC_KEY=dng24zqrqxbvbrh8 BT_ENVIRONMENT=sandbox DB_DATABASE=demo_invoicing DB_HOST=demo-invoicing-graphql.crznwonwxglm.eu-west-1.rds.amazonaws.com DB_MIGRATIONS_DIR=/migrations DB_PASSWORD=Vnc2etyLoFaeg39 DB_USERNAME=demo_invoicing_user npm start invoicing-graphql

AWS_REGISTRY="496598730381.dkr.ecr.eu-west-1.amazonaws.com"
AWS_ENVIRONMENT="dev"
TIMESTAMP=$(date +'%d_%m_%Y_%R')
CI_COMMIT_SHA="${USER}_${TIMESTAMP/:/_}"

# AFFECTED_APPS="demo-invoicing-graphql demo-invoicing-web"
APP="invoicing-web"
TO="${AWS_ENVIRONMENT}-${APP}"

printf -- "Build FrontEnd App for ${AWS_ENVIRONMENT} environment"
npm run build invoicing-web --configuration=production

printf -- "Dockerize FrontEnd App for ${AWS_ENVIRONMENT} environment"
APP=$APP TO=$TO AWS_ENVIRONMENT=$AWS_ENVIRONMENT AWS_REGISTRY=$AWS_REGISTRY CI_COMMIT_SHA=$CI_COMMIT_SHA ./tools/scripts/dockerize-local.sh

printf -- "Deploy FrontEnd App for ${AWS_ENVIRONMENT} environment"
aws --profile=production elasticbeanstalk update-environment --environment-name $AWS_ENVIRONMENT-invoicing-web --version-label $AWS_ENVIRONMENT-invoicing-web
