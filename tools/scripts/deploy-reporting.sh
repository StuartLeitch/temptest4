#!/bin/sh

export AWS_REGISTRY="918602980697.dkr.ecr.eu-west-1.amazonaws.com"
export AWS_ENVIRONMENT="dev"
export APP="reporting-backend"
export TO="${AWS_ENVIRONMENT}-${APP}"
export TIMESTAMP=$(date +'%d_%m_%Y_%R')
export CI_COMMIT_SHA="${USER}_${TIMESTAMP/:/_}"

_=$(command -v npm);
if [ "$?" != "0" ]; then
  printf -- "You don\'t seem to have NPM installed.\n";
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
#!/bin/sh

printf -- "\nBuild BackEnd App for ${AWS_ENVIRONMENT} environment\n"
npm run build reporting-backend --configuration=production

printf -- "\nDockerize BackEnd App for ${AWS_ENVIRONMENT} environment\n"
aws --profile=production ecr get-login --no-include-email | sh
APP=$APP TO=$TO AWS_ENVIRONMENT=$AWS_ENVIRONMENT AWS_REGISTRY=$AWS_REGISTRY CI_COMMIT_SHA=$CI_COMMIT_SHA ./tools/scripts/dockerize-local.sh

# printf -- "\nDeploy BackEnd App for ${AWS_ENVIRONMENT} environment\n"
aws --profile=production elasticbeanstalk update-environment --environment-name dev-reporting-backend --version-label dev-reporting-backend
aws --profile=production elasticbeanstalk update-environment --environment-name prod-gsw-reporting-backend --version-label dev-reporting-backend

printf -- '\n';

exit 0;
