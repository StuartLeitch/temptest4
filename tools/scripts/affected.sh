#!/bin/bash

if [[ ! -f dist/last-deploy.txt ]]; then
  git rev-parse HEAD~1 > dist/last-deploy.txt;
fi

echo "--base $(cat dist/last-deploy.txt)"
