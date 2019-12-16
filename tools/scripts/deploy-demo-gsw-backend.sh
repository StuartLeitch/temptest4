#!/bin/sh

printf -- "\nBuild BackEnd App for ${AWS_ENVIRONMENT} environment\n"
npm run build invoicing-graphql --configuration=production

printf -- "\nDockerize BackEnd App for ${AWS_ENVIRONMENT} environment\n"
APP=$APP TO=$TO AWS_ENVIRONMENT=$AWS_ENVIRONMENT AWS_REGISTRY=$AWS_REGISTRY CI_COMMIT_SHA=$CI_COMMIT_SHA ./tools/scripts/dockerize-local.sh

printf -- "\nDeploy BackEnd App for ${AWS_ENVIRONMENT} environment\n"
aws --profile=production elasticbeanstalk update-environment --environment-name demo-gsw-invoicing-graphql --version-label demo-gsw-invoicing-graphql
