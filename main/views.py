# -*- coding: utf-8 -*-
from django.conf import settings
from django.http.response import JsonResponse, HttpResponseBadRequest, HttpResponseRedirect, HttpResponseForbidden
from django.shortcuts import render
from django.views.generic import ListView, DetailView, TemplateView

from main.models import Note

class MyContextMixin(object):
    def get_context_data(self, **kwargs):
        # Call the base implementation first to get a context
        context = super(MyContextMixin, self).get_context_data(**kwargs)
        # Add in a QuerySet of all the books
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

class NoteView(MyContextMixin, DetailView):
    template_name = 'note.html'
    model = Note

    def get(self, request, *args, **kwargs):
        try:
            note = Note.objects.get(pk=kwargs['pk'])
            if 'json' in request.GET:
                return JsonResponse({'text': note.text, 'pk': note.pk, 'author': note.author and note.author.id})
        except KeyError:
            return HttpResponseBadRequest()
        return super(NoteView, self).get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        try:
            pk = kwargs['pk']
            note = Note.objects.get(pk=pk)
            if note.author and note.author != request.user:
                return HttpResponseForbidden(u"solo l'autore può modificare la nota")
            note.text = request.POST['text']
            note.save()
            return JsonResponse({'text': note.text})
        except KeyError:
            return HttpResponseBadRequest()