#!/usr/bin/env bash

set -e
set -x

files=$(shopt -s nullglob dotglob; echo reports/cucumber/*.json)
if (( ${#files} )); then
    node ./tools/scripts/cucumber/report.js
else
    echo "Missing test results. Skipping cucumber report generation."
fi
