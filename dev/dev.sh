#!/usr/bin/env bash

cd dev

mkdir -p data/db

case $1 in
  up)
    docker-compose -p invoicing up -d $2
    ;;
  down)
    docker-compose -p invoicing down
    ;;
  *)
    echo "Usage: $0 <up | down> [docker-compose args]"
esac
