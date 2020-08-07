for APP in $AFFECTED_APPS
do
  if [ -s "dist/apps/${APP}/Dockerfile" ]
  then
    echo "Building dist/apps/${APP}/Dockerfile"
    docker build -f dist/apps/$APP/Dockerfile -t $AWS_REGISTRY/$APP:$CI_COMMIT_SHA .
    docker push $AWS_REGISTRY/$APP:$CI_COMMIT_SHA
    # TODO check for git tag docker tag $AWS_REGISTRY/$APP:$CI_COMMIT_SHA $AWS_REGISTRY/$APP:$CI_COMMIT_TAG
    # docker push $AWS_REGISTRY/$APP:$CI_COMMIT_TAG
  else
    echo "Application ${APP} doesn't build a docker image. SKIPPING."
  fi
done

