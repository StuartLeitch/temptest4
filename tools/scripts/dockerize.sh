for APP in $AFFECTED_APPS
do
  # BUILD="$(basename -- $dir)"
  echo "Build Docker image for application '${APP}' using dist files from 'dist/apps/${APP}'"
  docker build -t $AWS_REGISTRY/$APP:$CI_COMMIT_SHA dist/apps/$APP
  echo "Pushed image to ${AWS_REGISTRY}/${APP}:${CI_COMMIT_SHA}"
  docker push $AWS_REGISTRY/$APP:$CI_COMMIT_SHA
  docker tag $AWS_REGISTRY/$APP:$CI_COMMIT_SHA $AWS_REGISTRY/$APP:dev
  echo "Pushed image to ${AWS_REGISTRY}/${APP}:dev"
  docker push $AWS_REGISTRY/$APP:dev
done

for LIB in $AFFECTED_LIBS
do
  echo "Build Docker image for library '${LIB}' using dist files from 'dist.libs/${LIB}'"
  docker build -t $AWS_REGISTRY/$LIB:$CI_COMMIT_SHA dist/libs/$LIB
  echo "Pushed image to ${AWS_REGISTRY}/${LIB}:${CI_COMMIT_SHA}"
  docker push $AWS_REGISTRY/$LIB:$CI_COMMIT_SHA
  docker tag $AWS_REGISTRY/$LIB:$CI_COMMIT_SHA $AWS_REGISTRY/$LIB:dev
  echo "Pushed image to ${AWS_REGISTRY}/${LIB}:dev"
  docker push $AWS_REGISTRY/$LIB:dev
done
