from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Sum, Count
from django.shortcuts import render
from animal.models import Animal
from room.models import Room
from ..models import Ticket, TicketType, ExtraService
from ..pages_views.promocode_views import PromoCode

def is_owner(user):
    return user.is_superuser

def is_employee(user):
    return user.is_authenticated and user.is_employee

def is_visitor(user):
    return user.is_authenticated and user.is_visitor

@login_required
@user_passes_test(is_owner)
def owner_dashboard(request):
    primates_food = Animal.objects.filter(
        family__name='Приматы'
    ).aggregate(total_food=Sum('daily_food'))
    
    canines_count = Room.objects.filter(
        animal__family__name='Псовые'
    ).aggregate(total=Sum('count'))
    
    species_pairs = Room.objects.annotate(
        species_count=Count('animals__species', distinct=True)
    ).filter(species_count__gt=1)
    
    return render(request, 'owner/dashboard.html', {
        'primates_food': primates_food['total_food'],
        'canines_count': canines_count['total'],
        'species_pairs': species_pairs
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

def public_info(request):
    animals = Animal.objects.all()[:10]  # Ограничиваем для примера
    rooms = Room.objects.all()
    ticket_types = TicketType.objects.all()
    services = ExtraService.objects.all()
    
    return render(request, 'public/info.html', {
        'animals': animals,
        'rooms': rooms,
        'ticket_types': ticket_types,
        'services': services
    })
    
def unregistered_employee_view(request):
    animals = Animal.objects.all().select_related('family', 'country')
    rooms = Room.objects.all()
    ticket_types = TicketType.objects.all()
    services = ExtraService.objects.all()
    promocodes = PromoCode.objects.filter(is_active=True)  # Только активные промокоды

    return render(request, 'employee/unregistered_employee_dashboard.html', {
        'animals': animals,
        'rooms': rooms,
        'ticket_types': ticket_types,
        'services': services,
        'promocodes': promocodes,
    })