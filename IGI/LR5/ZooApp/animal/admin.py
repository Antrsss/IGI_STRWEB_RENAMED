from django.contrib import admin
from .models import Animal, AnimalFamily, AnimalCountry, AnimalFoodType

class AnimalAdmin(admin.ModelAdmin):
    list_display = ('name', 'family', 'room', 'country', 'employee')
    list_filter = ('family', 'room', 'country', 'employee')
    search_fields = ('name', 'facts')
    raw_id_fields = ('employee',)

admin.site.register(Animal, AnimalAdmin)
admin.site.register(AnimalFamily)
admin.site.register(AnimalCountry)
admin.site.register(AnimalFoodType)