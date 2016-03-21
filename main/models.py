from __future__ import unicode_literals

from base64 import b32encode
from os import urandom

from django.contrib.auth.models import User
from django.db.models import Model
from django.db.models.fields import TextField, CharField, DateTimeField
from django.db.models.fields.related import ForeignKey

from django.conf import settings


class Note(Model):
    hash = CharField(max_length=16, primary_key=True)
    text = TextField()
    created_on = DateTimeField(auto_now_add=True)
    modified_on = DateTimeField(auto_now=True)
    author = ForeignKey(User, blank=True, null=True)

    def __unicode__(self):
        return '{:.40}'.format(self.text.replace('\n', ' '))

    def get_absolute_url(self):
        return '{}note/{}/'.format(settings.BASE_URL, self.hash)

    def save(self, *args, **kwargs):
        if not self.hash:
            self.hash = b32encode(urandom(10))
        return super(Note, self).save(*args, **kwargs)
