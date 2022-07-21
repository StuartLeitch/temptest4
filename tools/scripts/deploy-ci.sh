set -e
set -x

rm -rf dist-k8s
if [ $REQUIRED_APPS=="reporting-backend" && $NAMESPACE=="prod-hindawi" ]; then
    echo "Forcing install dependencies for reporting-backend production deployment to workaround cahce error!"
    yarn install
fi
yarn build invoicing-infrastructure
node dist/apps/invoicing-infrastructure/main.js
# kubectl apply -f ./dist-k8s/ --namespace=$NAMESPACE
