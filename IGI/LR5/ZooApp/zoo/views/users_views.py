from django.contrib.auth.decorators import login_required, user_passes_test
from django.shortcuts import render

def is_owner(user):
    return user.is_authenticated and user.is_superuser

@user_passes_test(is_owner)
def owner_dashboard(request):
    return render(request, 'owner/dashboard.html')

@login_required
def user_profile(request):
    return render(request, 'users/profile.html')

def public_page(request):
    return render(request, 'public.html')