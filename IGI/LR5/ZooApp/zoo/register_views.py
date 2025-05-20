from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from .forms import CustomUserCreationForm
from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()

def home(request):
    return render(request, 'home.html')

def register(request, role):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            if role == 'visitor':
                user.is_visitor = True
            elif role == 'employee':
                user.is_employee = True
            user.save()
            
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            return redirect(f'{role}_dashboard')
    else:
        form = CustomUserCreationForm()
    return render(request, 'register.html', {'form': form, 'role': role})

def user_login(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user, backend='django.contrib.auth.backends.ModelBackend')
                if user.is_employee:
                    return redirect('employee_dashboard')
                elif user.is_visitor:
                    return redirect('visitor_dashboard')
                elif user.is_superuser:
                    return redirect('superuser_dashboard')
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})