#!/usr/bin/env bash

set -ex

if [ -f "$1" ]; then
    node ./tools/scripts/cucumber/report.js "$1"
else
    echo "Missing $1 . Skipping cucumber report generation."
fi
