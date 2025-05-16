from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Sum, Count
from django.shortcuts import render
from animal.models import Animal
from room.models import Room
from ..models import Ticket, TicketType, ExtraService
from ..pages_views.promocode_views import PromoCode
from django.db.models import F, Sum 
from employee.models import Employee
from datetime import timezone, timedelta, datetime

now = datetime.now(timezone.utc)

def is_superuser(user):
    return user.is_superuser

def is_employee(user):
    return user.is_authenticated and user.is_employee

def is_visitor(user):
    return user.is_authenticated and user.is_visitor

@login_required
@user_passes_test(is_superuser)
def superuser_dashboard(request):
    primates_food = Animal.objects.filter(
        family__name__icontains='primate'
    ).exclude(food_type__isnull=True).annotate(
        daily_food=F('food_type__portion') * F('food_type__times')
    ).aggregate(
        primates_total=Sum('daily_food')
    )['primates_total'] or 0.0
    
    canines_count = Room.objects.filter(
        animals__family__name__icontains='canine'
    ).annotate(
        animal_count=Count('animals')
    ).aggregate(
        total_canines=Sum('animal_count')
    )['total_canines'] or 0
    
    species_pairs = Room.objects.annotate(
        species_count=Count('animals__family', distinct=True)
    ).values('name', 'species_count')
    
    rooms_info = Room.objects.values(
        'number', 'name', 'has_heating', 'has_swimming', 'square'
    ).order_by('number')
    
    six_months_ago = datetime.now(timezone.utc) - timedelta(days=180)
    animals_all = Animal.objects.select_related(
        'family', 'room', 'employee', 'food_type', 'country'
    ).order_by('-receipt_date')
    recent_animals = animals_all.filter(
        receipt_date__gte=six_months_ago
    )
    
    room_filter = request.GET.get('room')
    
    employees_query = Employee.objects.select_related(
        'position', 'user'
    ).prefetch_related(
        'animal_set'
    )
    
    if room_filter:
        employees_query = employees_query.filter(
            animal__room__id=room_filter
        ).distinct()
    
    employees_info = employees_query.values(
        'name',
        'phone',
        'email',
        'position__name',
        #'animal__room__name'
    ).order_by('name')
    
    all_rooms = Room.objects.values('id', 'name').order_by('name')
    
    return render(request, 'superuser/dashboard.html', {
        'primates_food': primates_food,
        'canines_count': canines_count,
        'species_pairs': species_pairs,
        'rooms_info': rooms_info,
        'animals_all': animals_all,
        'recent_animals': recent_animals,
        'employees_info': employees_info,
        'all_rooms': all_rooms,
        'selected_room': int(room_filter) if room_filter else None
    })

@login_required
@user_passes_test(is_employee)
def employee_dashboard(request):
    animals = request.user.animals.all().select_related('family', 'continent')
    return render(request, 'employee/dashboard.html', {'animals': animals})

@login_required
@user_passes_test(is_visitor)
def visitor_dashboard(request):
    tickets = Ticket.objects.filter(visitor=request.user)
    return render(request, 'visitor/dashboard.html', {'tickets': tickets})
    
def unregistered_employee_view(request):
    animals = Animal.objects.all().select_related('family', 'country')
    rooms = Room.objects.all()
    ticket_types = TicketType.objects.all()
    services = ExtraService.objects.all()
    promocodes = PromoCode.objects.filter(is_active=True)

    return render(request, 'unregistered_employee_dashboard.html', {
        'animals': animals,
        'rooms': rooms,
        'ticket_types': ticket_types,
        'services': services,
        'promocodes': promocodes,
    })