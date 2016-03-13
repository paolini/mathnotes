from django.contrib.admin import ModelAdmin, site

from main.models import Note


class NoteAdmin(ModelAdmin):
    exclude = ['id', ]
    list_display = ['id', 'created_on', 'modified_on', 'summary']

    def summary(self, object):
        return unicode(object)

site.register(Note, NoteAdmin)