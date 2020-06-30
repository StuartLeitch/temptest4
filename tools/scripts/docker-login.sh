# aws cli v2
aws ecr get-login-password \
    --region $AWS_REGION \
  | docker login \
    --username AWS \
    --password-stdin $AWS_REGISTRY
