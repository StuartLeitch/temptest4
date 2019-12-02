# AWS_REGISTRY="496598730381.dkr.ecr.eu-west-1.amazonaws.com"
AWS_REGISTRY="496598730381.dkr.ecr.eu-west-1.amazonaws.com"
AWS_ENVIRONMENT="demo"
TIMESTAMP=$(date +'%d_%m_%Y_%R')
CI_COMMIT_SHA="${USER}_${TIMESTAMP/:/_}"

# AFFECTED_APPS="demo-invoicing-graphql demo-invoicing-web"
APP="invoicing-graphql"
TO="${AWS_ENVIRONMENT}-${APP}"

APP=$APP TO=$TO AWS_ENVIRONMENT=$AWS_ENVIRONMENT AWS_REGISTRY=$AWS_REGISTRY CI_COMMIT_SHA=$CI_COMMIT_SHA ./tools/scripts/dockerize-local.sh
