from django.contrib.admin import ModelAdmin, site

from main.models import Note


class NoteAdmin(ModelAdmin):
    exclude = ['id', ]

site.register(Note, NoteAdmin)