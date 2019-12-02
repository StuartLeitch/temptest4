# AFFECTED_APPS='invoicing-graphql'
# AFFECTED_APPS='invoicing-graphql invoicing-web'

for APP in $APP
do
  echo "Building dist/apps/${APP}/Dockerfile"
  docker build -f dist/apps/$APP/Dockerfile -t $AWS_REGISTRY/$TO:$CI_COMMIT_SHA .
  docker push $AWS_REGISTRY/$TO:$CI_COMMIT_SHA
  docker tag $AWS_REGISTRY/$TO:$CI_COMMIT_SHA $AWS_REGISTRY/$TO:$AWS_ENVIRONMENT
  docker push $AWS_REGISTRY/$TO:$AWS_ENVIRONMENT
done
