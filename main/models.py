from __future__ import unicode_literals

from base64 import b64encode
from os import urandom

from django.contrib.auth.models import User
from django.db.models import Model
from django.db.models.fields import TextField, CharField, DateTimeField, IntegerField, BooleanField
from django.db.models.fields.related import ForeignKey

from django.conf import settings
from django.db.models import Manager


class NoteManager(Manager):
    def get_with_hash(self, hash):
        qs = self.filter(hash=hash).order_by('-created_on')
        if not qs:
            raise Note.DoesNotExist('Cannot find Note with hash {}'.format(hash))
        return qs[0]

class Note(Model):
    hash = CharField(max_length=8)
    text = TextField()
    created_on = DateTimeField(auto_now_add=True)
    modified_on = DateTimeField(auto_now=True)
    author = ForeignKey(User, blank=True, null=True)
    parent = ForeignKey('Note', blank=True, null=True, default=None)

    objects = NoteManager()

    def __unicode__(self):
        return '{:.40}'.format(self.text.replace('\n', ' '))

    def get_absolute_url(self):
        return '{}note/{}/'.format(settings.BASE_URL, self.hash)

    def save(self, *args, **kwargs):
        if not self.hash:
            self.hash = b64encode(urandom(6), altchars='_-')
        return super(Note, self).save(*args, **kwargs)

