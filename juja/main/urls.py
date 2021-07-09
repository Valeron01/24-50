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
<<<<<<< HEAD
    path('prodcuts', views.get_products),
    path('categories', views.get_categories),
    path('add_to_cart', views.add_to_cart),
=======
    path('products', views.get_products),
    path('categories', views.get_categories)
>>>>>>> b6cba89bc18b0ebf2187cd9a5280eb3e20b99dec
]