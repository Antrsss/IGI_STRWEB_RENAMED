from django.contrib import admin
from zoo.pages_models import Article, CompanyInfo, FAQ, Contacts, Vacancy, Review, PromoCode, PrivacyPolicy
from django.contrib.auth.admin import UserAdmin
from .models import User, TicketType, ExtraService, Ticket

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


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone', 'is_employee', 'is_visitor', 'position')
    list_filter = ('is_employee', 'is_visitor')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 
                                  'is_employee', 'is_visitor', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Employee info', {'fields': ('position',)}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'email', 'phone', 
                       'is_employee', 'is_visitor', 'position'),
        }),
    )

admin.site.register(User, CustomUserAdmin)

@admin.register(TicketType)
class TicketTypeAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'weekday_price', 'weekend_price')
    search_fields = ('name',)

@admin.register(ExtraService)
class ExtraServiceAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'price', 'description')
    search_fields = ('name',)
    list_editable = ('price',)

@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ('__str__', 'ticket_type', 'visitor', 'purchase_date', 'visit_date')
    list_filter = ('visit_date', 'ticket_type')
    search_fields = ('visitor__username', 'visitor__email')
    filter_horizontal = ('services',)
    date_hierarchy = 'visit_date'