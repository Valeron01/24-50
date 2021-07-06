from django.urls import path
from . import views

urlpatterns = [
    path('', views.index),
    path('get_json', views.ask_json),
    path('login', views.login),
]