from django.urls import path, re_path
from . import permission_views as views
from . import statistics_view as st_view

urlpatterns = [
    path('superuser/', views.superuser_dashboard, name='superuser_dashboard'),
    path('employee/', views.employee_dashboard, name='employee_dashboard'),
    path('visitor/', views.visitor_dashboard, name='visitor_dashboard'),
    path('common-info/', views.unregistered_employee_view, name='common_info_dashboard'),
    path('visitor/buy-ticket/', views.buy_ticket, name='buy_ticket'),
    re_path(r'^animals/(?P<animal_id>\d+)/?$', views.animal_detail, name='animal_detail'),
    path('statistics/', st_view.statistics_view, name='statistics'),
]