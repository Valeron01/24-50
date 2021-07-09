from json.encoder import JSONEncoder
from django.contrib.auth.models import User
from django.http.request import HttpRequest
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.template.loader import render_to_string
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm
from django.db import IntegrityError
from django.core.exceptions import ObjectDoesNotExist

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
            user_detail = UserDetail(user=user) # Создаём детальную инфу о пользователе

            user.save()
            user_detail.save()

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
        nums = Cart.objects.filter(user__id=request.user.id).values('num')

        products = Product.objects.filter(id__in=products_ids)

        products_info = []
        for i, n in zip(products, nums):
            p = {
                'productName':i.name,
                'cost':i.price,
                'seller':i.seller.username,
                'description':i.description,
                'category': i.category.name,
                'image': i.image_name,
                'num': n['num']
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
    if not request.user.is_authenticated:
        return HttpResponse(status=403)

    if request.method == 'POST':
        logout(request)
        return HttpResponse(status=200)

def offer(request:HttpRequest):
    if not request.user.is_authenticated:
        return HttpResponse(status=403)
    
    if request.method == "GET":
        return render(request, 'offer.html')
    if request.method == "POST":
        offer_data = OffersData(user=request.user, message=request.POST['message'])

        user = request.user
        user.first_name = request.POST['firstName']
        user.last_name = request.POST['lastName']


        user.save()
        offer_data.save()
        return HttpResponse(status=200)

def get_products(request):
    products = Product.objects.all()
    print(products)

    data = [{
            'productName': i.name,
            'cost': i.price,
            'seller': i.seller.username,
            'description': i.description,
            'category': i.category.name,
            'image': i.image_name,
            'id': i.id
            }
            for i in products]
    return JsonResponse({'products': data})

def get_categories(request):
    if request.method == 'POST':
        categories = Category.objects.all().values('name')
        categories = [i['name'] for i in categories]
    
        return JsonResponse({'categories': categories})
    return HttpResponse(status=500)

def add_to_cart(request:HttpRequest):
    if not request.user.is_authenticated:
        return HttpResponse(status=403)
    
    if request.method == 'GET':
        data = request.GET
        try:
            print('*'*100)
            print(data['id'])

            q = Cart.objects.get(user=request.user, product=0)

            q.num += int(data['num'])
            q.save()
        except ObjectDoesNotExist:
            c = Cart(request.user.id, data['id'], num=data['num'])
            c.save()
            pass

        return HttpResponse(status=200)
