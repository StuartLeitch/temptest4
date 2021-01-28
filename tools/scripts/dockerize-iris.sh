set -e

APP=iris
docker pull $AWS_REGISTRY/$APP:latest || true
docker build --cache-from $AWS_REGISTRY/$APP:latest -f apps/$APP/Dockerfile -t $AWS_REGISTRY/$APP:$CI_COMMIT_SHA -t $AWS_REGISTRY/$APP:latest .
echo "Push Docker image ${AWS_REGISTRY}/${APP}:${CI_COMMIT_SHA}"
docker push $AWS_REGISTRY/$APP:$CI_COMMIT_SHA
docker push $AWS_REGISTRY/$APP:latest
