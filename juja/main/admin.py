from django.contrib import admin
from django.contrib.auth.models import Group

from .models import *

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Cart)
admin.site.register(UserDetail)

@admin.register(OffersData)
class OffersDataAdmin(admin.ModelAdmin):
    change_form_template = "moderate_seller.html"

    def response_change(self, request, obj):
        if 'decline' in request.POST:
            obj.delete()
        if 'accept' in request.POST:
            seller_group = Group.objects.get(name='sellers')
            seller_group.user_set.add(request.user)
            obj.delete()
        return super().response_change(request, obj)