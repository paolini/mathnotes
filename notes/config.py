import os
import getpass

from ConfigParser import SafeConfigParser

HOST = os.uname()[1]

BASE_ROOT = os.path.dirname(os.path.abspath(__file__))
USERNAME = getpass.getuser()

class CustomConfigParser(SafeConfigParser):
    def getlist(self, section, option):
        opt = self.get(section, option)
        if not opt:
            return []
        return [x.strip() for x in opt.split(',')]

    def __getattr__(self, section):
        return dict(self.items(section))

config = CustomConfigParser()

# [config] section: these settings must be choosen depending on server configuration
config.add_section('config')
config.set('config', 'base_dir', os.path.dirname(os.path.dirname(__file__)))
config.set('config', 'user_home', os.path.expanduser('~'))
config.set('config', 'secret_key', 'afdjdkierncmddkfkeoaoafjruyyqnsdpofkmsdmsjennnffnd')
config.set('config', 'hostname', 'localhost')
config.set('config', 'server_url', 'http://localhost')
config.set('config', 'allowed_hosts', '')
config.set('config', 'base_url', '/')
config.set('config', 'static_root', '%(base_dir)s/static_root')
config.set('config', 'static_dirs', '%(base_dir)s/static')
config.set('config', 'static_url', '/static/')
config.set('config', 'media_root', '%(base_dir)s/media')
config.set('config', 'media_url', '/media/')
config.set('config', 'virtualenv', '')

# [database] section: database settings
config.add_section('database')
config.set('database', 'name', os.path.join(os.path.dirname(os.path.dirname(__file__)), 'db.sqlite3'))
config.set('database', 'user', USERNAME)
config.set('database', 'password', '')
config.set('database', 'host', '')
config.set('database', 'port', '')
config.set('database', 'engine', 'sqlite3')  # 'postgresql_psycopg2'

# [apache] section: apache configuration
config.add_section('apache')
config.set('apache', 'enable', 'False')
config.set('apache', 'conf_name', '')
config.set('apache', 'conf_filename', '')
config.set('apache', 'port', '80')
config.set('apache', 'server_admin', '')
config.set('apache', 'wsgi_user', '')

# [preferences] section: these settings can be choosen at will
config.add_section('preferences')
config.set('preferences', 'admins', '')
config.set('preferences', 'debug', 'True')
config.set('preferences', 'timezone', 'Europe/Rome')
config.set('preferences', 'language', 'en-us')
config.set('preferences', 'site_id', '1')

config.add_section('social')
config.set('social', 'facebook_key', '')
config.set('social', 'facebook_secret', '')
config.set('social', 'google_oauth2_key', '')
config.set('social', 'google_oauth2_secret', '')
config.set('social', 'twitter_key', '')
config.set('social', 'twitter_secret', '')

CONFIG_FILENAMES = [x for x in [
    os.environ.get('NOTES_CONFIG'),
    os.path.join(BASE_ROOT, 'config.ini'),
    os.path.join(os.path.dirname(BASE_ROOT), 'config.ini'),
    os.path.join(os.path.dirname(BASE_ROOT), 'notes.ini'),
    os.path.join(BASE_ROOT, 'notes.ini'),
    os.path.expanduser('~/.notes.ini'), ] if x]
for CONFIG_FILENAME in CONFIG_FILENAMES:
    if os.path.exists(CONFIG_FILENAME):
        print 'reading config file {}'.format(CONFIG_FILENAME)
        config.read([CONFIG_FILENAME])
        break
else:
    print "Warning: cannot find notes config file. Tried: " + ', '.join(CONFIG_FILENAMES)
