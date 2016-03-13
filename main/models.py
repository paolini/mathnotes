from __future__ import unicode_literals

from base64 import b32encode
from os import urandom

from django.db.models import Model
from django.db.models.fields import TextField, CharField, DateTimeField


class Note(Model):
    id = CharField(max_length=16, primary_key=True)
    text = TextField()
    created_on = DateTimeField(auto_now_add=True)
    modified_on = DateTimeField(auto_now=True)

    def __unicode__(self):
        return '{:.40}'.format(self.text.replace('\n', ' '))

    def get_absolute_url(self):
        return '/note/{}/'.format(self.id)

    def save(self, *args, **kwargs):
        if not self.id:
            self.id = b32encode(urandom(10))
        return super(Note, self).save(*args, **kwargs)