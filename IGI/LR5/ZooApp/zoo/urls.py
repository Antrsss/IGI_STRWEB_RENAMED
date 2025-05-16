from django.urls import path
from .users import permission_views as views

urlpatterns = [
    path('superuser/', views.superuser_dashboard, name='superuser_dashboard'),
    path('employee/', views.employee_dashboard, name='employee_dashboard'),
    path('visitor/', views.visitor_dashboard, name='visitor_dashboard'),
    path('guest/', views.unregistered_employee_view, name='unregistered_employee'),
    path('visitor/buy-ticket/', views.buy_ticket, name='buy_ticket'),
]