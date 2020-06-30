for APP in $AFFECTED_APPS
do
  if [ -s "dist/apps/${APP}/Dockerfile" ]
  then
    echo "Building dist/apps/${APP}/Dockerfile"
    docker build --build-arg BUILD_IMAGE=$BUILD_IMAGE --no-cache -f dist/apps/$APP/Dockerfile -t $AWS_REGISTRY/$APP:$CI_COMMIT_SHA .
    docker push $AWS_REGISTRY/$APP:$CI_COMMIT_SHA
    docker tag $AWS_REGISTRY/$APP:$CI_COMMIT_SHA $AWS_REGISTRY/$APP:ci-test
    docker push $AWS_REGISTRY/$APP:ci-test
  else
    echo "Application ${APP} doesn't build a docker image. SKIPPING."
  fi
done

