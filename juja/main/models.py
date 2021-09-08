from django.db import models
from django.contrib.auth.models import User
#бля ну какте-тои зменения
class Category(models.Model):
    name = models.CharField(max_length=200)

    def __str__(self):
        return f'{self.name}'
    
    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'

class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.CharField(max_length=1000)
    category = models.ForeignKey(Category, models.CASCADE)
    price = models.FloatField()
    seller = models.ForeignKey(User, models.CASCADE)
    image_name = models.CharField(max_length=50, default='noimage.png')

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'Продукт'
        verbose_name_plural = 'Продукты'

class Cart(models.Model):
    user = models.ForeignKey(User, models.CASCADE)
    product = models.ForeignKey(Product, models.CASCADE)
    num = models.IntegerField(default=1)
    class Meta:
        unique_together = [['user', 'product']]
        verbose_name = 'Корзина'
        verbose_name_plural = 'Корзины'

    def __str__(self):
        return f'{self.id}; {self.user.username} -> {self.product} x {self.num}'


class UserDetail(models.Model):
    user = models.ForeignKey(User, models.CASCADE)
    balance = models.FloatField(default=0)

    def __str__(self):
        return f'{self.user.username}, balance: {self.balance}'
    
    class Meta:
        verbose_name = 'Детализация пользователя'
        verbose_name_plural = 'Детализации пользователей'


class OffersData(models.Model):
    user = models.ForeignKey(User, models.CASCADE)
    message = models.CharField(max_length=1000)

    def __str__(self):
        return f'{self.user.username} -> {self.message[:100]}...'
    
    class Meta:
        verbose_name = 'Заявка на становление продавцом'
        verbose_name_plural = 'Заявки на становление продавцом'