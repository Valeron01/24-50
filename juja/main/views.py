from django.shortcuts import render
from django.http import HttpResponse, JsonResponse

# Create your views here.

def index(request):
    return render(request, 'index.html')

def login(request):
    pass

def ask_json(request):
    dict = {
        'user':'Valeron',
        'GET':request.GET,
        'POST':request.POST
    }
    
    return JsonResponse(dict)