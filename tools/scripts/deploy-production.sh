#!/bin/sh

printf -- 'Deploy Back End App for "demo" environment'
./deploy-demo-backend.sh

printf -- 'Deploy Front End App for "demo" environment'
./deploy-demo-frontend.sh
