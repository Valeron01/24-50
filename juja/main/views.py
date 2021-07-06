from json.encoder import JSONEncoder
from django.contrib.auth.models import User
from django.http.request import HttpRequest
from django.http.response import Http404
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.template.loader import render_to_string
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.db import IntegrityError

# Create your views here.


def index(request):
    print(request.user)
    return render(request, 'index.html')


def register_page(request):
    if request.user.is_authenticated:
        return HttpResponse('already logged in', status=405)# Если залогинены, отправляем 405

    if request.method == 'GET':
        return render(request, 'register.html') # отправляем отрендеренный шаблон формы для регистрации
    
    if request.method == 'POST':
        data = request.POST
        if len(data['login']) < 4 or len(data['email']) < 4 or len(data['password']) < 4:
            return Http404()
        try:
            user = User.objects.create_user(data['login'], data['email'], data['password'])
        except IntegrityError:
            return HttpResponse('<h1>Duplicated login</h1>')

        print(user)
        return JsonResponse({'user': str(user.email)})
    




def login_page(request:HttpRequest):
    if request.user.is_authenticated:
        return HttpResponse('already logged in', status=405)# Если залогинены, отправляем 405


    if request.method == 'GET':
        return render(request, 'login.html') # отправляем отрендеренный шаблон формы для логина
    
    if request.method == 'POST':
        user = authenticate(username=request.POST['login'], password=request.POST['password']) # Ищем пользователя в бд
        if user is not None: # Если нашли
            login(request, user) # Логинимся 
            return  JsonResponse({'is_logged' : True}) # отправляем результат с удачей

        return JsonResponse({'is_logged' : False}) # с провалом


def ask_json(request):
    dict = {
        'user': 'Valeron',
        'GET': request.GET,
        'POST': request.POST
    }

    return JsonResponse(dict)
