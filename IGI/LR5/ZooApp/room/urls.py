from django.urls import path
from room import views

app_name = 'rooms'

urlpatterns = [
    path("", views.index, name='index'),
    path("create/", views.create, name='create'),
    #path("edit/<int:id>/", views.edit, name='edit'),
    path("delete/<int:id>/", views.delete, name='delete'),
]
