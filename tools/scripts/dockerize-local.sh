export AWS_REGISTRY=918602980697.dkr.ecr.eu-west-1.amazonaws.com
export AWS_REGION=eu-west-1

export BUILDER_REPO=$AWS_REGISTRY/belzebuth-runner
export CI_COMMIT_SHA=$(git rev-parse HEAD)
export VERSION=$USER-$CI_COMMIT_SHA

export BUILD_IMAGE=$BUILDER_REPO:$VERSION
export LATEST_BUILD_IMAGE=$BUILDER_REPO:latest

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
./$CURR_DIR/docker-login.sh
./$CURR_DIR/dockerize-builder.sh
./$CURR_DIR/dockerize-apps.sh
