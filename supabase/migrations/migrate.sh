#!/usr/bin/env bash

BASEDIR=$(dirname "$0")

psql \
  --single-transaction \
  --variable ON_ERROR_STOP=1 \
  --file $BASEDIR/schema.sql \
  --file $BASEDIR/roles.sql \
  --file $BASEDIR/data.sql \
  --dbname "postgresql://postgres:postgres@localhost:54322/postgres"
