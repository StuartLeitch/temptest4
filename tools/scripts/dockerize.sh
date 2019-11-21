AFFECTED_APPS='invoicing-graphql invoicing-web'
for APP in $AFFECTED_APPS
do
  if [ -s "dist/apps/${APP}/Dockerfile" ]
  then
    echo "Building dist/apps/${APP}/Dockerfile"
    docker build -f dist/apps/$APP/Dockerfile -t $AWS_REGISTRY/$APP:$CI_COMMIT_SHA .
    docker push $AWS_REGISTRY/$APP:$CI_COMMIT_SHA
    docker tag $AWS_REGISTRY/$APP:$CI_COMMIT_SHA $AWS_REGISTRY/$APP:dev
    docker push $AWS_REGISTRY/$APP:dev
  else
    echo "Application ${APP} doesn't build a docker image. SKIPPING."
  fi
done

for LIB in $AFFECTED_LIBS
do
  if [ -s "dist/libs/${LIB}/Dockerfile" ]
  then
    echo "Building dist/libs/${LIB}/Dockerfile"
    docker build -t $AWS_REGISTRY/$LIB:$CI_COMMIT_SHA dist/libs/$LIB
    docker push $AWS_REGISTRY/$LIB:$CI_COMMIT_SHA
    docker tag $AWS_REGISTRY/$LIB:$CI_COMMIT_SHA $AWS_REGISTRY/$LIB:dev
    docker push $AWS_REGISTRY/$LIB:dev
  else
    echo "Library ${LIB} doesn't build a docker image. SKIPPING."
  fi
done
