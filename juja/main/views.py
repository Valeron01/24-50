from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.template.loader import render_to_string

# Create your views here.


def index(request):
    return render(request, 'index.html')


def login(request):
    #rendered_page_html = render_to_string('login.html')

    return render(request, 'login.html')#JsonResponse({'html': rendered_page_html})


def ask_json(request):
    dict = {
        'user': 'Valeron',
        'GET': request.GET,
        'POST': request.POST
    }

    return JsonResponse(dict)
