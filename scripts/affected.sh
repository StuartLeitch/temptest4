#!/bin/bash

if [[ ! -f dist/last-deploy.txt ]] then
  mkdir dist && git rev-parse HEAD~1 > dist/last-deploy.txt
fi
echo 'export AFFECTED_ARGS="--base $(cat dist/last-deploy.txt)"' >> $BASH_ENV
source $BASH_ENV
echo $AFFECTED_ARGS
