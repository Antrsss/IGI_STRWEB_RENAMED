from django.urls import path
from . import views

urlpatterns = [
    path('owner/', views.owner_dashboard, name='owner_dashboard'),
    path('profile/', views.user_profile, name='user_profile'),
    path('public/', views.public_page, name='public_page'),
]