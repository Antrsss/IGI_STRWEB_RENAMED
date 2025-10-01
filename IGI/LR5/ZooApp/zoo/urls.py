from django.urls import path, re_path
from . import permission_views as views
from . import statistics_view as st_view
from .pages_views import recall_views
from .pages_views import privacy_policy_views
from .pages_views import ticket_detail
from .pages_views import certificate_views

urlpatterns = [
    path('superuser/', views.superuser_dashboard, name='superuser_dashboard'),
    path('employee/', views.employee_dashboard, name='employee_dashboard'),
    path('visitor/', views.visitor_dashboard, name='visitor_dashboard'),
    path('common-info/', views.unregistered_employee_view, name='common_info_dashboard'),
    path('visitor/buy-ticket/', views.buy_ticket, name='buy_ticket'),
    re_path(r'^animals/(?P<animal_id>\d+)/?$', views.animal_detail, name='animal_detail'),
    path('statistics/', st_view.statistics_view, name='statistics'),
    path('ticket-statistics/', st_view.ticket_statistics_view, name='ticket_statistics'),
    
    path("recalls/", recall_views.recall_index, name="recalls"),
    path("recalls/create/", recall_views.recall_create, name="recall_create"),
    path("recalls/<int:id>/edit/", recall_views.recall_edit, name="recall_edit"),
    path("recalls/<int:id>/delete/", recall_views.recall_delete, name="recall_delete"),
    
    path("pages/privacy-policy/", privacy_policy_views.privacy_policy, name="privacy_policy"),
    
    path("tickets/<int:id>/", ticket_detail.ticket_detail, name="ticket_detail"),
    path("tickets/<int:id>/add/", ticket_detail.add_to_cart, name="add_to_cart"),
    path("tickets/<int:id>/remove/", ticket_detail.remove_from_cart, name="remove_from_cart"),
    path("tickets/<int:id>/delete/", ticket_detail.delete_from_cart, name="delete_from_cart"),
    path("cart/", ticket_detail.cart_view, name="cart"),
    path("checkout/", ticket_detail.checkout, name="checkout"),
    
    path("certificate/", certificate_views.certificate, name="certificate"),
]