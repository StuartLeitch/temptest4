set -e
set -x

rm -rf dist-k8s
#generate kube manifests
node dist/apps/invoicing-infrastructure/main.js
#delete potential orphans, changing the phenom-charts version messes with resource name generation and this leads to duplicate resources creation,
#where new deployments are created instead of detecting the old ones
#kubectl -n $NAMESPACE get deployments | awk '/invoicing|import/{print $1}' | xargs kubectl delete -n $NAMESPACE deployment || true
#rollout the changes
# kubectl apply -f ./dist-k8s/ --namespace=$NAMESPACE
# echo 'Waiting for pod startup...'
# #await container status
# kubectl -n $NAMESPACE get deployments | awk '/invoicing|import/{print $1}' | while read line; do
#   kubectl rollout status deployments -n $NAMESPACE  $line
# done
# echo 'Waiting for pod startup... Done!'

