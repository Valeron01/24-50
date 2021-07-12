from django.contrib import admin

from .models import *

admin.site.register(Category)
admin.site.register(Product)
admin.site.register(Cart)
admin.site.register(UserDetail)

@admin.register(OffersData)
class OffersDataAdmin(admin.ModelAdmin):
    change_form_template = "moderate_seller.html"

    def response_change(self, request, obj):
        ud = UserDetail.objects.get(user__pk=request.user.id)
        if 'decline' in request.POST:
            ud.is_seller = False # Оно и так фолс, но пусть будет
            obj.delete()
        if 'accept' in request.POST:
            ud.is_seller = True
            obj.delete()
        
        ud.save()
        return super().response_change(request, obj)