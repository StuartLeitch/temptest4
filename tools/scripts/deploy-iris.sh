#!/bin/sh

export AWS_REGISTRY="918602980697.dkr.ecr.eu-west-1.amazonaws.com"
export APP="iris"
export TO="${APP}"
export AWS_ENVIRONMENT="prod"
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

aws ecr get-login --no-include-email | sh

CURR_DIR="$(dirname $0)"

echo "Building dist/apps/${APP}/Dockerfile"
docker build -f apps/$APP/Dockerfile -t $AWS_REGISTRY/$TO:$CI_COMMIT_SHA .
docker push $AWS_REGISTRY/$TO:$CI_COMMIT_SHA
echo "Running commmand: docker tag ${AWS_REGISTRY}/${TO}:${CI_COMMIT_SHA} ${AWS_REGISTRY}/${TO}:${AWS_ENVIRONMENT}";
docker tag $AWS_REGISTRY/$TO:$CI_COMMIT_SHA $AWS_REGISTRY/$TO:$AWS_ENVIRONMENT
docker push $AWS_REGISTRY/$TO:$AWS_ENVIRONMENT

# printf -- "\nDeploy BackEnd App for ${AWS_ENVIRONMENT} environment\n"
aws --profile=production elasticbeanstalk update-environment --environment-name reporting-superset --version-label iris-prod

printf -- '\n';

exit 0;
