from django.http.response import JsonResponse, HttpResponseBadRequest
from django.shortcuts import render
from django.views.generic import ListView, DetailView, TemplateView

from main.models import Note

class NotesView(ListView):
    template_name = 'notes.html'
    model = Note

class NoteView(DetailView):
    template_name = 'note.html'
    model = Note

    def get(self, request, *args, **kwargs):
        try:
            note = Note.objects.get(pk=kwargs['pk'])
            if 'json' in request.GET:
                return JsonResponse({'text': note.text, 'pk': note.pk})
        except KeyError:
            return HttpResponseBadRequest()
        return super(NoteView, self).get(request, *args, **kwargs)

    def post(self, request, *args, **kwargs):
        try:
            pk = kwargs['pk']
            note = Note.objects.get(pk=pk)
            note.text = request.POST['text']
            note.save()
            return JsonResponse({'text': note.text})
        except KeyError:
            return HttpResponseBadRequest()