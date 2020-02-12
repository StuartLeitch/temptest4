#!/bin/sh

AWS_REGISTRY="918602980697.dkr.ecr.eu-west-1.amazonaws.com"
TIMESTAMP=$(date +'%d_%m_%Y_%R')
CI_COMMIT_SHA="${USER}_${TIMESTAMP/:/_}"

# AFFECTED_APPS="demo-invoicing-graphql demo-invoicing-web"
AWS_ENVIRONMENT="prod"
APP="invoicing-admin"
TO="${AWS_ENVIRONMENT}-${APP}"

printf -- "Build FrontEnd App for ${AWS_ENVIRONMENT} environment"
npm run build invoicing-admin --configuration=production

printf -- "Dockerize Admin FrontEnd App for ${AWS_ENVIRONMENT} environment\n"
APP=$APP TO=$TO AWS_ENVIRONMENT=$AWS_ENVIRONMENT AWS_REGISTRY=$AWS_REGISTRY CI_COMMIT_SHA=$CI_COMMIT_SHA ./tools/scripts/dockerize-admin-local.sh

printf -- "Deploy Admin FrontEnd App for ${AWS_ENVIRONMENT} environment\n"
aws --profile=production elasticbeanstalk update-environment --environment-name $AWS_ENVIRONMENT-invoicing-admin-frontend --version-label $AWS_ENVIRONMENT-invoicing-admin
