from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from notes.config import config

TEMPLATES = {
    'nginx': """# mathnotes_nginx.conf

# the upstream component nginx needs to connect to
upstream django {{
    server unix://{config.nginx[socket]}; # for a file socket
    # server unix://{settings.BASE_DIR}/mysite.sock; # for a file socket
    # server 127.0.0.1:8001; # for a web port socket
}}

# configuration of the server
server {{
    # the port your site will be served on
    listen     {config.nginx[port]};
    # the domain name it will serve for
    server_name {config.config[hostname]}; # your machine's IP address or FQDN
    charset     utf-8;

    # max upload size
    client_max_body_size 75M;   # adjust to taste

    # Django media
    # location /media  {{
    #    alias {settings.MEDIA_ROOT};  # your Django project's media files - amend as required
    # }}

    location /static {{
        alias {settings.STATIC_ROOT}; # your Django project's static files - amend as required
    }}

    # Finally, send all non-media requests to the Django server.
    location / {{
        uwsgi_pass  django;
        include     {settings.BASE_DIR}/uwsgi_params; # the uwsgi_params file you installed
    }}
}}
""",

    'uwsgi': """# mathnotes_uwsgi.ini file
[uwsgi]

# Django-related settings
# the base directory (full path)
chdir           = {settings.BASE_DIR}
# Django's wsgi file
module          = notes.wsgi
# the virtualenv (full path)
#home            = {config.config[virtualenv]}
# the virtualenv (full path)
virtualenv      = {config.config[virtualenv]}

uid = {config.config[user]}
gid = {config.config[group]}

stats = 127.0.0.1:8080


# process-related settings
# master
master          = true
# maximum number of worker processes
processes       = {config.uwsgi[processes]}
# the socket (use the full path to be safe
socket          = {config.uwsgi[socket]}
# ... with appropriate permissions - may be needed
chmod-socket    = {config.uwsgi[socket_chmod]}
# clear environment on exit
vacuum          = true
""",

    'systemd_service': """[Unit]
Description=uWSGI mathnotes
After=syslog.target
    
[Service]
ExecStart=/usr/local/bin/uwsgi --ini /etc/uwsgi/vassals/mathnotes.ini
#User={config.config[user]}
#Group={config.config[group]}
Restart=always
KillSignal=SIGQUIT
Type=notify
StandardError=syslog
NotifyAccess=all
""",

    'systemd_socket': """[Unit]
Description=Socket for uWSGI mathnotes

[Socket]
ListenStream={config.uwsgi[socket]}
#SocketUser={config.config[user]}
#SocketGroup={config.config[group]}
SocketMode=0666

[Install]
WantedBy=socket.target
    """,
}

OUTPUTS = {
    'nginx': '/etc/nginx/sites-available/mathnotes.conf',
    'ini': 'config.ini',
    'uwsgi': '/etc/uwsgi/vassals/mathnotes.ini',
    'systemd_service': '/etc/systemd/system/uwsgi.service',
    'systemd_socket': '/etc/systemd/system/uwsgi.socket',
}

class Command(BaseCommand):
    help = 'dump config file to stdout'

    def add_arguments(self, parser):
        parser.add_argument('conf',
                            choices=['ini', 'nginx', 'uwsgi', 'systemd_socket', 'systemd_service'],
                            help='ini: config.ini, nginx: nginx.conf, uwsgi=uwsgi.ini')
        parser.add_argument('--write',
                            help='write on actual conf file',
                            default=False,
                            action='store_true')
        
    def handle(self, conf, write, **options):
        def go(conf, output):
            if conf == 'ini':
                config.write(output)
            else:
    	        output.write(TEMPLATES[conf].format(
                    settings=settings,
                    config=config))
                
        if write:
            filename = OUTPUTS[conf]
            self.stdout.write('writing file {}'.format(filename))
            with open(filename,'wt') as output:
                go(conf, output)
        else:
            go(conf, self.stdout)
            

