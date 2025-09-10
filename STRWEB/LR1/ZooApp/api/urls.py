from django.urls import path
from .views import dogs_index, cats_index

urlpatterns = [
    path('dogs/', dogs_index),
    path('cats/', cats_index)
]
