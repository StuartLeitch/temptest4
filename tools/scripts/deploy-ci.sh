rm -rf dist-k8s
yarn build invoicing-infrastructure
node dist/apps/invoicing-infrastructure/main.js
k apply -f ./dist-k8s/
