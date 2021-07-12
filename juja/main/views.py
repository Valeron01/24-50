import os

from json.encoder import JSONEncoder

from django.contrib.auth.models import User
from django.contrib.auth.models import Group
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import UserCreationForm

from django.http.request import HttpRequest
from django.http import HttpResponse, JsonResponse

from django.shortcuts import render
from django.template.loader import render_to_string

from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError
from django.views.decorators.csrf import csrf_exempt

from .utils import *
from .models import *

def index(request):
    if request.method == "GET":
        return render(request, 'index.html')
        # Пиздец тебе, коомент ебаный
    if request.method == "POST":
        return render(request, 'main.html')


def check_auth(request):
    # Добавил поле "seller"
    return JsonResponse({'logged': request.user.is_authenticated,
                         'seller': request.user.groups.filter(name='sellers').exists()})


def register_page(request):
    if request.user.is_authenticated:
        # Если залогинены, отправляем 405
        return HttpResponse('already logged in', status=405)

    if request.method == 'GET':
        # отправляем отрендеренный шаблон формы для регистрации
        return render(request, 'register.html')

    if request.method == 'POST':
        data = request.POST

        if len(data['login']) < 4 or len(data['email']) < 4 or len(data['password']) < 4:  # Валидация данных
            return HttpResponse(status=400)
        try:
            user = User.objects.create_user(
                data['login'], data['email'], data['password'])  # пробуем зарегать
            # Создаём детальную инфу о пользователе
            user_detail = UserDetail(user=user)

            user.save()
            user_detail.save()

            login(request, user)  # логинимся
        except IntegrityError:
            # Посылаем на
            return JsonResponse({'is_reg': False, 'message': 'такой аккаунт уже есть'})

        # регистрация успешна
        return JsonResponse({'is_reg': True, 'user': str(user.email)})


def login_page(request: HttpRequest):
    if request.user.is_authenticated:
        # Если залогинены, отправляем 405
        return HttpResponse('already logged in', status=405)

    if request.method == 'GET':
        # отправляем отрендеренный шаблон формы для логина
        return render(request, 'login.html')

    if request.method == 'POST':
        # Ищем пользователя в бд
        user = authenticate(
            username=request.POST['login'], password=request.POST['password'])
        if user is not None:  # Если нашли
            login(request, user)  # Логинимся
            # отправляем результат с удачей
            return JsonResponse({'is_logged': True})

        return JsonResponse({'is_logged': False})  # с провалом


def user_page(request: HttpRequest):
    if request.method == 'GET':
        return render(request, 'user.html')

    if request.method == 'POST':
        if not request.user.is_authenticated:
            return HttpResponse(status=403)

        products_ids = Cart.objects.filter(
            user__id=request.user.id).values('product')
        nums = Cart.objects.filter(user__id=request.user.id).values('num')

        products = Product.objects.filter(id__in=products_ids)
        prices = Product.objects.filter(id__in=products_ids).values('price')

        products_info = []
        for i, n in zip(products, nums):
            p = {
                'productName': i.name,
                'cost': i.price,
                'seller': i.seller.username,
                'description': i.description,
                'category': i.category.name,
                'image': i.image_name,
                'num': n['num'],
                'id': i.id
            }
            products_info.append(p)

        summary_price = 0

        for n, p in zip(nums, prices):
            summary_price += n['num'] * p['price']

        data = {
            'username': request.user.username,
            'balance': UserDetail.objects.get(user=request.user).balance,
            'products': products_info,
            'summary_price': summary_price
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


def offer(request: HttpRequest):
    if not request.user.is_authenticated:
        return HttpResponse(status=403)

    if request.method == "GET":
        return render(request, 'offer.html')
    if request.method == "POST":
        offer_data = OffersData(
            user=request.user, message=request.POST['message'])

        user = request.user
        user.first_name = request.POST['firstName']
        user.last_name = request.POST['lastName']

        user.save()
        offer_data.save()
        return HttpResponse(status=200)


def get_products(request):
    products = Product.objects.all()

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
        categories = Category.objects.all().values('name', 'id')
        categories_names = [i['name'] for i in categories]
        categories_ids = [i['id'] for i in categories]

        return JsonResponse({'categories': categories_names, 'categories_ids': categories_ids})
    return HttpResponse(status=500)


def add_to_cart(request: HttpRequest):
    if not request.user.is_authenticated:
        return HttpResponse(status=403)

    if request.method == 'POST':
        data = request.POST
        try:  # Обновление уже существующей пары юзер - продукт
            q = Cart.objects.get(user=request.user, product__pk=data['id'])

            q.num += int(data['num'])
            q.save()
        except ObjectDoesNotExist:  # Добавление нового товара в корзину
            # Ищем продукт в списке продуктов
            product = Product.objects.get(pk=data['id'])

            c = Cart(user=request.user, product=product,
                     num=data['num'])  # Создаем новую корзину
            c.save()

        return HttpResponse(status=200)

    return HttpResponse(status=501)

def add_product(request: HttpRequest):
    if request.method == 'GET':
        return render(request, 'sender.html')

    if not request.user.is_authenticated or not request.user.groups.filter(name='sellers').exists():
        return HttpResponse(status=403)

    print('-'*50)
    print(request.GET)
    print(request.POST)
    print(request.FILES)
    if request.method =='POST':
        data = request.POST

        image = request.FILES['image']
        image_name = image.name

        product = Product(name=data['product_name'],
                      description=data['product_description'],
                      category=Category.objects.get(name=data['product_category']),
                      price=data['product_cost'],
                      seller=User.objects.get(username=request.user.username))

        file_ext = image_name[image_name.index('.'):]

        new_image_name = f'{product.id}{file_ext}'
        image_path = './main/static/img/products/' + new_image_name

        product.image_name = new_image_name
        product.save()

        with open(image_path, 'wb') as f:
            f.write(image.read())

        return HttpResponse('OK', status=200)
    
    return HttpResponse(status=500)


def modify_cart(request: HttpRequest):
    if not request.user.is_authenticated:
        return HttpResponse(status=403)

    data = request.POST

    product_id = list(data.keys())[0]

    cart = Cart.objects.get(product__pk=product_id)

    if data[product_id] == 'delete':
        cart.delete()
    elif data[product_id] == '+1':
        pass

    return JsonResponse({'name': cart.product.name})


def payment(request):
    if not request.user.is_authenticated:
        return HttpResponse(status=403)
    cart = Cart.objects.filter(user__id=request.user.id)

    products_ids = cart.values('product')
    products = Product.objects.filter(id__in=products_ids)

    summary_price = 0

    for c, p in zip(cart, products):
        seller_detail = UserDetail.objects.get(user__pk=p.seller.id)
        computed_price = c.num * p.price
        summary_price += computed_price

        seller_detail.balance += computed_price


    ud = UserDetail.objects.get(user=request.user)
    if summary_price < ud.balance:
        ud.balance -= summary_price
        ud.save()
        cart.delete()
        seller_detail.save()

    return JsonResponse({'data': 'success'})


def sort_category(request: HttpRequest()):
    if request.method == "POST":
        category_id = request.POST['category_id']

        products = Product.objects.filter(category__pk=category_id)

        data = [product_to_json(i) for i in products]
        return JsonResponse({'products': data}) #Заглушка
    return HttpResponse(status=500) # Загрушка

def top_up_balance(request):
    if not request.user.is_authenticated:
        return HttpResponse(status=403)
    if request.method == 'POST':
        user = UserDetail.objects.get(user__pk=request.user.id)

        user.balance += float(request.POST['sum'])
        user.save()
        return HttpResponse(status=200)
    return HttpResponse(status=505)

def products_seller(request):
    if not request.user.groups.filter(name='sellers').exists():
        return HttpResponse(status=403)
    
    if request.method == "GET":
        return render(request, 'seller.html')
    if request.method == "POST":
        products = Product.objects.filter(seller__pk=request.user.id) # Сделать выборку по товарам текущего пользователя если он продавец

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
    return HttpResponse(status=505)

def delete_product(request):
    if request.method == "POST":
        product_id = request.POST['product_id']
        product = Product.objects.get(id=product_id)
        product.delete()
        return HttpResponse(status=200)



def test_page(request):
    if request.method == 'GET':
        return render(request, 'my_sender.html')
    
    if request.method == 'POST':
        print('-'*50)
        print(requets.POST)
        print(request.FILES)