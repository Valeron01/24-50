from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('index', views.index),
    path('get_json', views.ask_json),
    path('login', views.login_page),
    path('register', views.register_page),
    path('user', views.user_page)
]