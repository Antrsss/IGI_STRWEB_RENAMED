from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from .forms import CustomUserCreationForm
from django.contrib.auth import get_user_model
from django.utils import timezone
import pytz

User = get_user_model()

from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.forms import AuthenticationForm
from .forms import CustomUserCreationForm
from django.contrib.auth import get_user_model
from django.utils import timezone
import pytz
from .models import PartnerCompany, TicketType
from .pages_models import Article

User = get_user_model()

def home(request):
    context = {}

    if request.user.is_authenticated:
        user_timezone = getattr(request.user, 'timezone', 'UTC')
        try:
            tz = pytz.timezone(user_timezone)
        except pytz.UnknownTimeZoneError:
            tz = pytz.UTC
            user_timezone = 'UTC'

        local_time = timezone.now().astimezone(tz)
        utc_time = timezone.now().astimezone(pytz.UTC)
        hours_diff = (local_time - utc_time).total_seconds() / 3600

        context.update({
            'user_timezone': user_timezone,
            'local_time': local_time,
            'utc_time': utc_time,
            'hours_diff': hours_diff,
            'current_date': local_time.date(),
        })

    latest_article = Article.objects.order_by('-pub_date').first()
    partners = PartnerCompany.objects.all()
    ticket_types = TicketType.objects.all()

    context.update({
        'latest_article': latest_article,
        'partners': partners,
        'ticket_types': ticket_types,
        'banners': [
            '/static/banners/banner_1.png',
            '/static/banners/banner_2.png',
            '/static/banners/banner_3.png',
            '/static/banners/banner_4.png',
        ]
    })

    return render(request, 'home.html', context)

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