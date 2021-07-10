from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('index', views.index),
    path('login', views.login_page),
    path('register', views.register_page),
    path('user', views.user_page),
    path('exit', views.exit),
    path('auth', views.check_auth),
    path('offer', views.offer),
    path('products', views.get_products),
    path('categories', views.get_categories),
    path('add_to_cart', views.add_to_cart),
    path('add_product', views.add_product),
    path('modify_cart', views.modify_cart),
    path('payment', views.payment),
    path('sort_category', views.sort_category),
]