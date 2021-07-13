# Generated by Django 3.2.5 on 2021-07-08 21:07

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('main', '0006_product_image_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='cart',
            name='num',
            field=models.IntegerField(default=1),
        ),
        migrations.AlterField(
            model_name='userdetail',
            name='balance',
            field=models.FloatField(default=0),
        ),
        migrations.CreateModel(
            name='OffersData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('message', models.CharField(max_length=1000)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
