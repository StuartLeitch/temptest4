#!/bin/sh

export AWS_REGISTRY="496598730381.dkr.ecr.eu-west-1.amazonaws.com"
export AWS_ENVIRONMENT="dev"
export APP="invoicing-graphql"
export TO="${AWS_ENVIRONMENT}-${APP}"
export TIMESTAMP=$(date +'%d_%m_%Y_%H_%M')
export CI_COMMIT_SHA="${USER}_${TIMESTAMP}"

_=$(command -v yarn);
if [ "$?" != "0" ]; then
  printf -- "You don\'t seem to have yarn installed.\n";
  # printf -- 'Get it: https://www.docker.com/community-edition\n';
  printf -- "Exiting with code 127...\n";
  exit 127;
fi;

_=$(command -v aws);
if [ "$?" != "0" ]; then
  printf -- "You don\'t seem to have AWS installed.\n";
  printf -- "Get it: https://aws.amazon.com/cli/\n";
  printf -- "Exiting with code 127...\n";
  exit 127;
fi;

CURR_DIR="$(dirname $0)"

printf -- '\033[33m\033[1m> Deploy Back End App for "migration" environment\033[0m\n'


printf -- "\nBuild BackEnd App for migration environment\n"
yarn run build invoicing-graphql --configuration=production

printf -- "\nDockerize BackEnd App for migration environment\n"
aws --profile=dev ecr get-login --no-include-email | sh
APP=$APP TO=$TO AWS_ENVIRONMENT=$AWS_ENVIRONMENT AWS_REGISTRY=$AWS_REGISTRY CI_COMMIT_SHA=$CI_COMMIT_SHA ./tools/scripts/dockerize-local.sh

printf -- "\nDeploy BackEnd App for ${AWS_ENVIRONMENT} environment\n"
aws --profile=production elasticbeanstalk update-environment --environment-name migration-invoicing --version-label dev-invoicing-graphql


printf -- '\n';

exit 0;
