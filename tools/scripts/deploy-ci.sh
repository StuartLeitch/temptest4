set -e

rm -rf dist-k8s
yarn build invoicing-infrastructure
node dist/apps/invoicing-infrastructure/main.js
kubectl apply -f ./dist-k8s/
