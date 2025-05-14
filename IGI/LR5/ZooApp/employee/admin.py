from django.contrib import admin
from .models import Employee, EmployeePosition

class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'phone', 'email')
    list_filter = ('position',)
    search_fields = ('name', 'email', 'phone')
    ordering = ('name',)

admin.site.register(Employee, EmployeeAdmin)
admin.site.register(EmployeePosition)