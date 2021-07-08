from json.encoder import JSONEncoder
from django.contrib.auth.models import User
from django.http.request import HttpRequest
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.template.loader import render_to_string
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.db import IntegrityError
from .models import *

def index(request):
    print(request.user)
    if request.method == "GET":
        return render(request, 'index.html')
        # Пиздец тебе, коомент ебаный
    if request.method == "POST":
        return render(request, 'main.html')

def check_auth(request):
    return JsonResponse({'logged': request.user.is_authenticated})

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

def user_page(request:HttpRequest):
    if request.method == 'GET':
        return render(request, 'user.html')
    
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponse(status=403)

        products_ids = Cart.objects.filter(user__id=request.user.id).values('product')

        products = Product.objects.filter(id__in=products_ids)

        products_info = []
        for i in products:
            p = {
                'productName':i.name,
                'cost':i.price,
                'seller':i.seller.username
            }
            products_info.append(p)

        
        data = {
            'username': request.user.username,
            'balance': UserDetail.objects.get(user=request.user).balance,
            'products': products_info
        }

        # передаем данные о пользователе
        #   Имя
        #   Баланс
        #   Cписок товаров в корзине {{productName: 'name', cost: '0', seller: 'sellerName'}}
        # data = {'username': }
        # ну я типо блять тут хуё-моё что-то написал
        return JsonResponse(data)

def exit(request):
    if request.method == 'POST':
        logout(request)
        return HttpResponse(status=200)

def offer(request):
    if request.method == "GET":
        return render(request, 'offer.html')
    if request.method == "POST":
        
        

        return HttpResponse(status=200)

def ask_json(request):
    dict = {
        'user': 'Valeron',
        'GET': request.GET,
        'POST': request.POST
    }

    return JsonResponse(dict)
