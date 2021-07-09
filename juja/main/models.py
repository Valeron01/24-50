from django.db import models
from django.contrib.auth.models import User

class Category(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return f'{self.name}'

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=1000)
    category = models.ForeignKey(Category, models.CASCADE)
    price = models.FloatField()
    seller = models.ForeignKey(User, models.CASCADE)
    image_name = models.CharField(max_length=50, default='noimage.png')

    def __str__(self):
        return self.name

class Cart(models.Model):
    user = models.ForeignKey(User, models.CASCADE)
    product = models.ForeignKey(Product, models.CASCADE)
    num = models.IntegerField(default=1)
    class Meta:
        unique_together = [['user', 'product']]

    def __str__(self):
        return f'{self.user.username} -> {self.product}x{self.num}'

class UserDetail(models.Model):
    user = models.ForeignKey(User, models.CASCADE)
    balance = models.FloatField(default=0)
    is_seller = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.user.username}, balance: {self.balance}'


class OffersData(models.Model):
    user = models.ForeignKey(User, models.CASCADE)
    message = models.CharField(max_length=1000)

    def __str__(self):
        return f'{self.user.username} -> {self.message[:100]}...'