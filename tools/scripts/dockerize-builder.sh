set -e

docker pull $LATEST_BUILD_IMAGE || true
docker build --cache-from $LATEST_BUILD_IMAGE -t $BUILD_IMAGE -t $LATEST_BUILD_IMAGE -f Dockerfile.build .
docker build -t $BUILD_IMAGE -t $LATEST_BUILD_IMAGE -f Dockerfile.build .
docker push $BUILD_IMAGE
docker push $LATEST_BUILD_IMAGE
