from django.conf import settings

def my_context(request):
    return {'settings': settings}