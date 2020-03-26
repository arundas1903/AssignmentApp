"""assignmentApp URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
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

from core_views.views import home, list_users, user_detail, set_password, search_users
from auth_views.views import login, user_logout, set_phone

urlpatterns = [
    path('home/', home, name='home'),
    path('login/', login, name='login'),
    path('logout/', user_logout, name='logout'),
    path('oauth/', include('social_django.urls', namespace='social')),
    path('admin/', admin.site.urls),
    path('users/all/', list_users, name='list_users'),
    path('users/<pk>/', user_detail, name='user_detail'),
    path('password/', set_password, name='set_password'),
    path('set_phone/', set_phone, name='set_phone'),
    path('search/', search_users, name='search'),
]
