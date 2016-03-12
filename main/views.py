from django.shortcuts import render
from django.views.generic import ListView, DetailView

from main.models import Note


class NotesView(ListView):
    template_name = 'notes.html'
    model = Note

class NoteView(DetailView):
    template_name = 'note.html'
    model = Note