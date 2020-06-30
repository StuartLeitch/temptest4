# Setup environment

1. Install minikube https://kubernetes.io/docs/tasks/tools/install-minikube/
2. Make minikube use docker local repo
   `eval $(minikube docker-env)`
3. Build sisif test:
   `yarn run build sisif-test`
4. Build image version (look at sisif/Chart.yaml -> version should be the same version you are building)
   `docker build -f dist/apps/sisif-test/Dockerfile -t sisif:0.2.12 .`
5. Install the helm charts below

### Install redis

```sh
helm install test-redis stable/redis --values ./apps/sisif-test/sisif/test-redis.yaml
```

### Install sisif

```sh
helm install sisif ./apps/sisif-test/sisif --values ./apps/sisif-test/sisif/values.yaml --values ./apps/sisif-test/sisif/test-values.yaml
```

### Upgrade sisif

```sh
helm upgrade sisif ./apps/sisif-test/sisif --values ./apps/sisif-test/sisif/values.yaml --values ./apps/sisif-test/sisif/test-values.yaml
```
