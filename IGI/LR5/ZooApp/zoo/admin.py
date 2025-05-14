from django.contrib import admin
from zoo.pages_models import Article, CompanyInfo, FAQ, Contacts, EmployeePositions, Vacancy, Review, PromoCode, PrivacyPolicy
from animal.models import Animal, AnimalFamily, AnimalCountry, AnimalFoodType
from employee.models import Employee, EmployeePosition
from room.models import Room

@admin.register(Article)    
class ArticleAdmin(admin.ModelAdmin):
    list_display = ('title', 'pub_date', 'is_published')
    list_filter = ('is_published',)
    search_fields = ('title', 'short_description')

@admin.register(CompanyInfo)
class CompanyInfoAdmin(admin.ModelAdmin):
    pass

@admin.register(FAQ)
class FAQAdmin(admin.ModelAdmin):
    list_display = ('question', 'date_added')
    search_fields = ('question', 'answer')

@admin.register(Contacts)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('name', 'position', 'phone', 'email', 'is_active')
    list_filter = ('position', 'is_active')
    search_fields = ('name', 'position__name')

@admin.register(Vacancy)
class VacancyAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'created_at')
    list_filter = ('is_active',)
    search_fields = ('title', 'description')

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'rating', 'pub_date', 'is_published')
    list_filter = ('rating', 'is_published')
    search_fields = ('author_name', 'text')

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount', 'is_active', 'expiry_date')
    list_filter = ('is_active',)
    search_fields = ('code', 'description')

@admin.register(PrivacyPolicy)
class PrivacyPolicyAdmin(admin.ModelAdmin):
    pass