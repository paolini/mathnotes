# -*- coding: utf-8 -*-
from django.conf import settings
from django.core.urlresolvers import reverse
from django.http.response import JsonResponse, HttpResponseBadRequest, HttpResponseRedirect, HttpResponseForbidden
from django.views.generic import ListView, View
from django.views.generic.base import TemplateResponseMixin
from django.utils.translation import ugettext as _

from main.models import Note

class MyContextMixin(object):
    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(MyContextMixin, self).get_context_data(**kwargs)
        context['settings'] = settings
        return context

class NotesView(MyContextMixin, ListView):
    template_name = 'notes.html'
    model = Note
    ordering = ("-modified_on", )

    def post(self, request, *args, **kwargs):
        if 'new' in request.POST:
            note = Note()
            if request.user.id:
                note.author = request.user
            note.save()
            return HttpResponseRedirect(note.get_absolute_url()+'?edit')
        else:
            return HttpResponseBadRequest()

class NoteView(MyContextMixin, TemplateResponseMixin, View):
    template_name = 'note.html'
    model = Note

    def get_object(self):
        hash = self.kwargs['hash']
        self.object = Note.objects.get_with_hash(hash)

    def get_context_data(self, **kwargs):
        """
        Insert the single object into the context dict.
        """
        context = {}
        context['object'] = self.object
        context['note'] = self.object
        context.update(kwargs)
        return context

    def get(self, request, *args, **kwargs):
        self.get_object()
        note = self.object
        try:
            if 'json' in request.GET:
                return JsonResponse(note.as_dict())
        except KeyError:
            return HttpResponseBadRequest()
        context = self.get_context_data()
        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        self.get_object()
        note = self.object
        if request.POST.get('clone'):
            note.clone()
            note.author = None
            if request.user.id:
                note.author = request.user
            note.save()
            return HttpResponseRedirect(note.get_absolute_url())
        if request.POST.get('delete'):
            if note.author and note.author != request.user:
                return HttpResponseForbidden(_(u"solo l'autore può cancellare la nota"))
            note.delete()
            return HttpResponseRedirect(reverse("note_list"))
        try:
            if note.author and note.author != request.user:
                return HttpResponseForbidden(_(u"solo l'autore può modificare la nota"))
            note.text = request.POST['text']
            note.title = request.POST['title']
            note.save()
            return JsonResponse(note.as_dict())
        except KeyError:
            return HttpResponseBadRequest()