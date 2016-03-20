import os
import sys
import site

from os.path import expanduser

PROJECT_PATH = os.path.dirname(os.path.abspath(__file__))
VIRTUALENV_PATH = os.path.join(expanduser('~'), '.virtualenvs', 'notes')

# vedi http://thecodeship.com/deployment/deploy-django-apache-virtualenv-and-mod_wsgi/
site.addsitedir(os.path.join(VIRTUALENV_PATH, 'local', 'lib', 'python2.7', 'site-packages'))

sys.path.insert(0,PROJECT_PATH)
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "notes.settings")

activate_env = os.path.join(VIRTUALENV_PATH, 'bin', 'activate_this.py')
execfile(activate_env, dict(__file__=activate_env))

# This application object is used by any WSGI server configured to use this
# file. This includes Django's development server, if the WSGI_APPLICATION
# setting points here.
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# Apply WSGI middleware here.
# from helloworld.wsgi import HelloWorldApplication
# application = HelloWorldApplication(application)
