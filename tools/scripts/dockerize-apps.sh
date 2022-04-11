set -e
set -x

for APP in $AFFECTED_APPS
do
  if [ -s "dist/apps/${APP}/Dockerfile" ]
  then
    echo "Building dist/apps/${APP}/Dockerfile"
    docker pull $AWS_REGISTRY/$APP:latest || true
    DOCKER_BUILDKIT=1 docker build --build-arg BUILDKIT_INLINE_CACHE=1 --cache-from $AWS_REGISTRY/$APP:latest -f dist/apps/$APP/Dockerfile -t $AWS_REGISTRY/$APP:$CI_COMMIT_SHA -t $AWS_REGISTRY/$APP:latest .
    echo "Push Docker image ${AWS_REGISTRY}/${APP}:${CI_COMMIT_SHA}"
    docker push $AWS_REGISTRY/$APP:$CI_COMMIT_SHA
    docker push $AWS_REGISTRY/$APP:latest
  else
    echo "Application ${APP} doesn't build a docker image. SKIPPING."
  fi
done
