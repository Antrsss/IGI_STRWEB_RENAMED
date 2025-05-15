from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib import messages
from ..forms import CustomUserCreationForm

def home(request):
    return render(request, 'home.html')

def register(request, role):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save(commit=False)
            if role == 'employee':
                user.is_employee = True
            elif role == 'visitor':
                user.is_visitor = True
            user.save()
            login(request, user)
            return redirect(f'{role}_dashboard')
    else:
        form = CustomUserCreationForm()
    return render(request, 'register.html', {'form': form, 'role': role})

def user_login(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request, data=request.POST)
        if form.is_valid():
            username = form.cleaned_data.get('username')
            password = form.cleaned_data.get('password')
            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                if user.is_employee:
                    return redirect('employee_dashboard')
                elif user.is_visitor:
                    return redirect('visitor_dashboard')
                elif user.is_superuser:
                    return redirect('owner_dashboard')
    else:
        form = CustomUserCreationForm()
    return render(request, 'login.html', {'form': form})