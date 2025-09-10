from django.contrib import admin
from .models import Room

class RoomAdmin(admin.ModelAdmin):
    list_display = ('name', 'number', 'has_swimming', 'has_heating', 'square')
    list_filter = ('has_swimming', 'has_heating')
    search_fields = ('name', 'number')

admin.site.register(Room, RoomAdmin)