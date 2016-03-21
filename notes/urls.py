"""notes URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic import TemplateView

from main.views import NotesView, NoteView

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^js/note.js', TemplateView.as_view(template_name='note.js', content_type='application/javascript')),
    url(r'^css/bootstrap.css', TemplateView.as_view(template_name='bootstrap.css', content_type='text/css')),
    url(r'^$', NotesView.as_view(), name='note_list'),
    url(r'^note/(?P<hash>[A-Z0-9]+)/', NoteView.as_view()),
    url('', include('social.apps.django_app.urls', namespace='social')),
    url('^', include('django.contrib.auth.urls', namespace='auth')),
]
