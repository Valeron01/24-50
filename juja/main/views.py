from json.encoder import JSONEncoder
from django.contrib.auth.models import User
from django.http.request import HttpRequest
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.template.loader import render_to_string
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.db import IntegrityError
from django.contrib.auth.decorators import login_required
import base64

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

        if len(data['login']) < 4 or len(data['email']) < 4 or len(data['password']) < 4: # Валидация данных
            return HttpResponse(status=400)
        try:
            user = User.objects.create_user(data['login'], data['email'], data['password']) # пробуем зарегать
            login(request, user) # логинимся
        except IntegrityError:
            return JsonResponse({'is_reg': False, 'message': 'такой аккаунт уже есть'}) # Посылаем на
        
        return JsonResponse({'is_reg': True, 'user': str(user.email)}) # регистрация успешна
    




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



def user_page(request:HttpRequest()):
    if request.user.is_authenticated:
        return render(request, 'user.html')
    return HttpResponse(status=403)


def ask_json(request):
    dict = {
        'user': 'Valeron',
        'GET': request.GET,
        'POST': request.POST
    }

    return JsonResponse(dict)
