#!/usr/bin/env bash

set -ex
# echo $1

node ./tools/scripts/cucumber/report.js $1
