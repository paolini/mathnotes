# -*- coding: utf-8 -*-
from django.conf import settings
from django.http.response import JsonResponse, HttpResponseBadRequest, HttpResponseRedirect, HttpResponseForbidden
from django.shortcuts import render
from django.views.generic import ListView, DetailView, TemplateView, View
from django.views.generic.base import TemplateResponseMixin

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

    def post(self, request, *args, **kwargs):
        if 'new' in request.POST:
            note = Note()
            if request.user.id:
                note.author = request.user
            note.save()
            return HttpResponseRedirect(note.get_absolute_url())
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
                return JsonResponse({'text': note.text, 'hash': note.hash, 'author': note.author and note.author.id})
        except KeyError:
            return HttpResponseBadRequest()
        context = self.get_context_data()
        return self.render_to_response(context)

    def post(self, request, *args, **kwargs):
        self.get_object()
        note = self.object
        try:
            if note.author and note.author != request.user:
                return HttpResponseForbidden(u"solo l'autore può modificare la nota")
            note.text = request.POST['text']
            note.save()
            return JsonResponse({'text': note.text})
        except KeyError:
            return HttpResponseBadRequest()