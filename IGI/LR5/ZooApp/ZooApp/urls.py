"""
URL configuration for ZooApp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from zoo.views import article_views
from django.contrib.auth import views as auth_views


urlpatterns = [
    path('positions/', article_views.position_list, name='position_list'),
    path('positions/create/', article_views.create, name='position_create'),
    path('positions/<int:pk>/', article_views.position_detail, name='position_detail'),
    path('positions/<int:pk>/update/', article_views.position_update, name='position_update'),
    path('positions/<int:pk>/delete/', article_views.position_delete, name='position_delete'),
    path('admin/', admin.site.urls),
    path('login/', auth_views.LoginView.as_view(template_name='login.html'), name = 'login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('register/', article_views.register, name='register'),
    path('oauth/', include('social_django.urls', namespace='social')),
    
    
    path('animals/', include(('animal.urls', 'animal'), namespace='animal')),
    path('rooms/', include(('room.urls', 'room'), namespace='room')),
    path('employees/', include(('employee.urls', 'employee'), namespace='employee'))
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
