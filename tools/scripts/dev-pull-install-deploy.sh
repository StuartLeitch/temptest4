if [ "$1" == "-h" ] || [ $# -eq 0 ]; then
    echo "\nScript needs a branch to pull from"
    echo "Script runs -- deploy-qa.sh -- and -- deploy-dev-admin-frontend.sh -- to deploy on dev environment"
    echo "\nUsage: `basename $0` [git-branch-name]\n"
    exit 0
fi

set -e

GREEN='\033[0;32m'
NC='\033[0m'
prefix="\n${GREEN}========>${NC}"
suffix="${GREEN}<========${NC}\n"

echo "${prefix} Git checkout & pull from branch  --- $1 --- ${suffix}"
git remote update --prune
git checkout $1
git pull

echo "${prefix} Run yarn install ${suffix}"
yarn install


echo "${prefix} Login to AWS -dev- for deploy of Payer app ${suffix}"
aws --profile=dev ecr get-login --no-include-email | sh

set +e
echo "${prefix} Run deploy-qa.sh script ${suffix}"
./tools/scripts/deploy-qa.sh


set -e
echo "${prefix} Login to AWS -production- for deploy of Admin app ${suffix}"
aws --profile=production ecr get-login --no-include-email | sh

set +e
echo "${prefix} Run ./tools/scripts/deploy-dev-admin-frontend.sh script ${suffix}"
./tools/scripts/deploy-dev-admin-frontend.sh
