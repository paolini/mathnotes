from __future__ import unicode_literals

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
    title = CharField(max_length=160, default='senza titolo')
    text = TextField()
    created_on = DateTimeField(auto_now_add=True)
    modified_on = DateTimeField(auto_now=True)
    author = ForeignKey(User, blank=True, null=True)
    parent = ForeignKey('Note', blank=True, null=True, default=None)

    objects = NoteManager()

    def __init__(self, *args, **kwargs):
        super(Note, self).__init__(*args, **kwargs)
        if not self.hash:
            self.hash = self.new_hash()

    def __unicode__(self):
        return '{:.40}'.format(self.title)

    def get_absolute_url(self):
        return '{}note/{}/'.format(settings.BASE_URL, self.hash)

    @classmethod
    def new_hash(cls):
        return urandom(6).encode('base-64')[:8].replace('/', '_').replace('+', '-')

    def save(self, *args, **kwargs):
        return super(Note, self).save(*args, **kwargs)

    def clone(self):
        self.parent_id = self.id
        self.id = None
        self.hash = self.new_hash()

    def as_dict(self):
        return {
            'title': self.title,
            'text': self.text,
            'hash': self.hash,
            'author': self.author and self.author.id, }
