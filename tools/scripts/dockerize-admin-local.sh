printf -- "Building apps/${APP}/Dockerfile\n"

echo "docker build -f apps/$APP/src/Dockerfile -t $AWS_REGISTRY/$TO:$CI_COMMIT_SHA . \n"
docker build -f apps/$APP/src/Dockerfile -t $AWS_REGISTRY/$TO:$CI_COMMIT_SHA .
docker push $AWS_REGISTRY/$TO:$CI_COMMIT_SHA

printf -- "Running commmand: docker tag ${AWS_REGISTRY}/${TO}:${CI_COMMIT_SHA} ${AWS_REGISTRY}/${TO}:${AWS_ENVIRONMENT}";
docker tag $AWS_REGISTRY/$TO:$CI_COMMIT_SHA $AWS_REGISTRY/$TO:$AWS_ENVIRONMENT
docker push $AWS_REGISTRY/$TO:$AWS_ENVIRONMENT
