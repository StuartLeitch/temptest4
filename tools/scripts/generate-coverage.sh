#!/usr/bin/env bash

set -ex

# Get coverage from unit tests
#./node_modules/.bin/nyc --silent ./node_modules/.bin/mocha 'src/**/*_spec.ts'

# Get coverage from feature tests (join with unit test via --no-clean)
# yarn build-local
# ./node_modules/.bin/nyc --silent --no-clean node ./node_modules/.bin/cucumber-js
# ./node_modules/.bin/nyc --silent --no-clean yarn run nx run-many --target=cucumber --projects=invoicing-graphql --configuration=production

# Generate a report
./node_modules/.bin/nyc report --reporter=lcov
echo "Open 'file://$(pwd)/coverage/lcov-report/index.html' in your browser"
