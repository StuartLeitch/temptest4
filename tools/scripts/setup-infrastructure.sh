helm repo add bitnami https://charts.bitnami.com/bitnami
# todo add nodegroup-type=database
helm upgrade --install sisif bitnami/redis --set cluster.enabled=false --set master.nodeSelector.nodegroup-type=application
