from django.urls import path
from .users import permission_views as views

urlpatterns = [
    path('owner/', views.owner_dashboard, name='owner_dashboard'),
    path('employee/', views.employee_dashboard, name='employee_dashboard'),
    path('visitor/', views.visitor_dashboard, name='visitor_dashboard'),
    path('public/', views.public_info, name='public_info'),
    path('guest/', views.unregistered_employee_view, name='unregistered_employee'),
    #path('buy-ticket/', views.buy_ticket, name='buy_ticket'),
]