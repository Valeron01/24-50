# Generated by Django 3.2.5 on 2021-07-08 19:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_userdetail'),
    ]

    operations = [
        migrations.AddField(
            model_name='userdetail',
            name='is_seller',
            field=models.BooleanField(default=False),
        ),
    ]
