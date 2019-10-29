for APP in $AFFECTED_APPS
do
  # BUILD="$(basename -- $dir)"
  docker build -f ./Dockerfile -t $AWS_REGISTRY/$APP:$CI_COMMIT_SHA dist/apps/$APP
  docker push $AWS_REGISTRY/$APP:$CI_COMMIT_SHA
  docker tag $AWS_REGISTRY/$APP:$CI_COMMIT_SHA $AWS_REGISTRY/$APP:dev
  docker push $AWS_REGISTRY/$APP:dev
done

for LIB in $AFFECTED_LIBS
do
  docker build -f ./Dockerfile -t $AWS_REGISTRY/$LIB:$CI_COMMIT_SHA dist/libs/$LIB
  docker push $AWS_REGISTRY/$LIB:$CI_COMMIT_SHA
  docker tag $AWS_REGISTRY/$LIB:$CI_COMMIT_SHA $AWS_REGISTRY/$LIB:dev
  docker push $AWS_REGISTRY/$LIB:dev
done
