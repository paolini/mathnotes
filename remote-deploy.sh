#!/usr/bin/env bash

## inserire i valori deploy_host e deploy_dir nella sezione [deploy]
## del file config.ini

DEPLOY_HOST=$(awk -F "=" '/deploy_host/ {print $2}' config.ini)
DEPLOY_DIR=$(awk -F "=" '/deploy_dir/ {print $2}' config.ini)

echo DEPLOY_HOST ${DEPLOY_HOST}
echo DEPLOY_DIR ${DEPLOY_DIR}

ssh ${DEPLOY_HOST}  ${DEPLOY_DIR}/deploy.sh
