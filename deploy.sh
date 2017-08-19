#!/bin/bash
set -e

pushd "$( dirname "${BASH_SOURCE[0]}" )"

## inserire il valore deploy_virtualenv nella sezione [deploy]
## del file config.ini

DEPLOY_VIRTUALENV=$(awk -F "=" '/deploy_virtualenv/ {print $2}' config.ini)

if [ -z "$DEPLOY_VIRTUALENV" ] ; then
    echo "==== no VIRTUALENV"
    echo "==== You should set deploy_virtualenv in [deploy] section of config.ini"
    exit
else
    echo ==== activate virtualenv ${DEPLOY_VIRTUALENV}
    . ${DEPLOY_VIRTUALENV}/bin/activate
fi
echo ==== update source code
git pull

echo ==== update pip packages
pip install -r requirements.txt

echo ==== migrate
./manage.py migrate --noinput

echo ==== collectstatic
./manage.py collectstatic --noinput

echo ==== touch wsgi
touch notes/wsgi.py

echo ==== completed

popd

