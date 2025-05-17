from django.contrib.auth.decorators import login_required, user_passes_test
from django.db.models import Sum, Count
from django.shortcuts import render, redirect
from animal.models import Animal, AnimalFamily, AnimalCountry
from room.models import Room
from ..models import Ticket, TicketType, ExtraService
from ..pages_views.promocode_views import PromoCode
from django.db.models import F, Sum 
from django.contrib import messages
from employee.models import Employee
from datetime import timezone, timedelta, datetime
from ..forms import TicketPurchaseForm
from django.shortcuts import render
from django.db.models import Count

primate_family = 'Primate'
dog_family = 'Dog'

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
        family__name__icontains=primate_family
    ).exclude(food_type__isnull=True).annotate(
        daily_food=F('food_type__portion') * F('food_type__times')
    ).aggregate(
        primates_total=Sum('daily_food')
    )['primates_total'] or 0.0
    

    canines_count = Room.objects.filter(
        animals__family__name__icontains=dog_family
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
    recent_animals = animals_all.filter(receipt_date__gte=six_months_ago)
    
    room_filter = request.GET.get('room')
    selected_room_name = None

    employees_query = Employee.objects.select_related('position')

    if room_filter:
        employees_query = employees_query.filter(
            animal__room__id=room_filter
        ).distinct()
        selected_room = Room.objects.filter(id=room_filter).first()
        selected_room_name = selected_room.name if selected_room else None

    employees_info = []
    for emp in employees_query:
        rooms = Room.objects.filter(
            animals__employee=emp
        ).distinct().values('id', 'name')
        
        animals = Animal.objects.filter(employee=emp).select_related('room', 'family')
        
        employees_info.append({
            'id': emp.id,
            'name': emp.name,
            'phone': str(emp.phone) if emp.phone else 'Not specified',
            'email': emp.email,
            'position': emp.position.name if emp.position else 'No position',
            'rooms': list(rooms),
            'animals_count': animals.count(),
            'photo_url': emp.photo.url if emp.photo else None,
            'info': emp.info or 'No additional info'
        })

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
        'selected_room': int(room_filter) if room_filter else None,
        'selected_room_name': selected_room_name,
        'six_months_ago': six_months_ago
    })
    
@login_required
@user_passes_test(is_employee)
def employee_dashboard(request):
    employee = request.user.employee
    
    animals = Animal.objects.filter(employee=employee).select_related(
        'family', 'country', 'room', 'food_type'
    ).annotate(
        daily_food=F('food_type__portion') * F('food_type__times')
    ).order_by('room__name', 'family__name')

    rooms_data = {}
    
    for animal in animals:
        room = animal.room
        if room.id not in rooms_data:
            rooms_data[room.id] = {
                'name': room.name,
                'number': room.number,
                'has_swimming': room.has_swimming,
                'has_heating': room.has_heating,
                'square': room.square,
                'animals_count': Animal.objects.filter(room=room).count(),
                'animals': []
            }
        
        animal_data = {
            'id': animal.id,
            'name': animal.name,
            'species': animal.family.name if animal.family else "Unknown",
            'country': animal.country.name if animal.country else "Unknown",
            'receipt_date': animal.receipt_date,
            'birthday': animal.birthday,
            'facts': animal.facts,
            'photo_url': animal.photo.url if animal.photo else None,
            'has_food_info': animal.food_type is not None,
            'food_type': animal.food_type.food_name if animal.food_type else None,
            'food_portion': animal.food_type.portion if animal.food_type else None,
            'feeding_times': animal.food_type.times if animal.food_type else None,
            'daily_food': animal.daily_food if animal.food_type else None
        }
        
        rooms_data[room.id]['animals'].append(animal_data)

    return render(request, 'employee/dashboard.html', {
        'rooms_data': rooms_data.values(),
        'employee_name': employee.name
    })

@login_required
@user_passes_test(is_visitor)
def visitor_dashboard(request):
    visitor = request.user
    
    tickets = Ticket.objects.filter(visitor=visitor).select_related(
        'ticket_type', 'promo_code'
    ).prefetch_related('services').order_by('-visit_date')
    
    promocodes = visitor.promocodes.filter(
        is_active=True,
        expiry_date__gte=datetime.now(timezone.utc)
    )
    
    context = {
        'user': visitor,
        'tickets': tickets,
        'promocodes': promocodes,
        'today': datetime.now(timezone.utc)
    }
    
    return render(request, 'visitor/dashboard.html', context)

@login_required
@user_passes_test(is_visitor)
def buy_ticket(request):
    if request.method == 'POST':
        form = TicketPurchaseForm(request.POST)
        if form.is_valid():
            ticket = form.save(commit=False)
            ticket.visitor = request.user
            
            # Применяем промокод если он есть
            promo_code = form.cleaned_data.get('promo_code')
            if promo_code:
                try:
                    promo = PromoCode.objects.get(code=promo_code, is_active=True)
                    ticket.promo_code = promo
                except PromoCode.DoesNotExist:
                    messages.error(request, 'Invalid promo code')
            
            ticket.save()
            form.save_m2m()  # Сохраняем many-to-many отношения (услуги)
            
            messages.success(request, 'Ticket purchased successfully!')
            return redirect('visitor_dashboard')
    else:
        form = TicketPurchaseForm()
    
    return render(request, 'visitor/buy_ticket.html', {'form': form})

def unregistered_employee_view(request):
    animals = Animal.objects.select_related(
        'family', 'country', 'room', 'food_type', 'employee'
    ).annotate(
        daily_food=F('food_type__portion') * F('food_type__times')
    ).order_by('family__name', 'name')
    
    rooms = Room.objects.annotate(
        animal_count=Count('animals'),
        species_count=Count('animals__family', distinct=True)
    ).prefetch_related('animals', 'animals__family').order_by('number')
    
    ticket_types = TicketType.objects.all()
    
    services = ExtraService.objects.all()
    
    promocodes = PromoCode.objects.filter(
        is_active=True,
        expiry_date__gte=datetime.now(timezone.utc)
    )
    
    families = AnimalFamily.objects.annotate(
        animal_count=Count('animals')
    ).prefetch_related('animals__room').order_by('name')
    
    countries = AnimalCountry.objects.annotate(
        animal_count=Count('animals')
    ).prefetch_related('animals__room').order_by('name')

    context = {
        'animals': animals,
        'rooms': rooms,
        'ticket_types': ticket_types,
        'services': services,
        'promocodes': promocodes,
        'families': families,
        'countries': countries,
        'current_date': datetime.now(timezone.utc),
        'weekend_days': [5, 6]
    }
    
    return render(request, 'unauthenticated/dashboard.html', context)