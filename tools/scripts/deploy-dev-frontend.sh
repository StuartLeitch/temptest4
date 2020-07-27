#!/bin/sh

AWS_REGISTRY="496598730381.dkr.ecr.eu-west-1.amazonaws.com"
AWS_ENVIRONMENT="dev"
TIMESTAMP=$(date +'%d_%m_%Y_%H_%M')
CI_COMMIT_SHA="${USER}_${TIMESTAMP}"

# AFFECTED_APPS="demo-invoicing-graphql demo-invoicing-web"
APP="invoicing-web"
TO="${AWS_ENVIRONMENT}-${APP}"

printf -- "Build FrontEnd App for ${AWS_ENVIRONMENT} environment"
yarn run build invoicing-web --configuration=production

printf -- "Dockerize FrontEnd App for ${AWS_ENVIRONMENT} environment"
APP=$APP TO=$TO AWS_ENVIRONMENT=$AWS_ENVIRONMENT AWS_REGISTRY=$AWS_REGISTRY CI_COMMIT_SHA=$CI_COMMIT_SHA ./tools/scripts/dockerize-local.sh

printf -- "Deploy FrontEnd App for ${AWS_ENVIRONMENT} environment"
aws --profile=production elasticbeanstalk update-environment --environment-name $AWS_ENVIRONMENT-invoicing-web --version-label $AWS_ENVIRONMENT-invoicing-web
