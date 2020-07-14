#!/bin/sh

export AWS_REGISTRY="918602980697.dkr.ecr.eu-west-1.amazonaws.com"
export AWS_ENVIRONMENT="prod"
export APP="invoicing-graphql"
export TO="${AWS_ENVIRONMENT}-gsw-${APP}"
export TIMESTAMP=$(date +'%d_%m_%Y_%R')
export CI_COMMIT_SHA="${USER}_${TIMESTAMP/:/_}"

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

printf -- '\033[33m>\033[0m Deploy Back End App for "GSW prod" environment\n'
./$CURR_DIR/deploy-$AWS_ENVIRONMENT-gsw-backend.sh

printf -- '\033[33m>\033[0m Deploy Front End App for "GSW prod" environment\n'
./$CURR_DIR/deploy-$AWS_ENVIRONMENT-gsw-frontend.sh

printf -- '\n';

exit 0;
