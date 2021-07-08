from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=200)

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=1000)
    category = models.ForeignKey(Category, models.CASCADE)
    price = models.FloatField()
    seller = models.ForeignKey(User, models.CASCADE)

class Cart(models.Model):
    user = models.ForeignKey(User, models.CASCADE)
    product = models.ForeignKey(Product, models.CASCADE)

class UserDetail(models.Model):
    user = models.ForeignKey(User, models.CASCADE)
    balance = models.FloatField()