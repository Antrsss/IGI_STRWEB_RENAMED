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
from django.db.models import Prefetch

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
    # Статистика по приматам
    primates_food = Animal.objects.filter(
        family__name__icontains='primate'
    ).exclude(food_type__isnull=True).annotate(
        daily_food=F('food_type__portion') * F('food_type__times')
    ).aggregate(
        primates_total=Sum('daily_food')
    )['primates_total'] or 0.0
    
    # Количество собак
    canines_count = Room.objects.filter(
        animals__family__name__icontains='canine'
    ).annotate(
        animal_count=Count('animals')
    ).aggregate(
        total_canines=Sum('animal_count')
    )['total_canines'] or 0
    
    # Комнаты с несколькими видами
    species_pairs = Room.objects.annotate(
        species_count=Count('animals__family', distinct=True)
    ).values('name', 'species_count')
    
    # Вся информация о комнатах
    rooms_info = Room.objects.values(
        'number', 'name', 'has_heating', 'has_swimming', 'square'
    ).order_by('number')
    
    # Животные (все и недавние)
    six_months_ago = datetime.now(timezone.utc) - timedelta(days=180)
    animals_all = Animal.objects.select_related(
        'family', 'room', 'employee', 'food_type', 'country'
    ).order_by('-receipt_date')
    recent_animals = animals_all.filter(receipt_date__gte=six_months_ago)
    
    # Фильтр по комнате для сотрудников
    room_filter = request.GET.get('room')
    selected_room_name = None

    # Базовый запрос для сотрудников
    employees_query = Employee.objects.select_related('position')

    if room_filter:
        # Фильтруем сотрудников, которые ухаживают за животными в выбранной комнате
        employees_query = employees_query.filter(
            animal__room__id=room_filter  # Используем прямое имя связи
        ).distinct()
        selected_room = Room.objects.filter(id=room_filter).first()
        selected_room_name = selected_room.name if selected_room else None

    # Подготавливаем данные для шаблона
    employees_info = []
    for emp in employees_query:
        # Получаем комнаты через животных сотрудника
        rooms = Room.objects.filter(
            animals__employee=emp
        ).distinct().values('id', 'name')
        
        # Получаем животных сотрудника через обратную связь
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
        'family',
        'country',
        'room',
        'food_type'
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
        
        # Правильно рассчитываем информацию о кормлении
        if animal.food_type:
            feeding_info = f"{animal.food_type.times} times a day ({animal.food_type.food_name}, {animal.food_type.portion} kg each)"
        else:
            feeding_info = "Not specified"
        
        rooms_data[room.id]['animals'].append({
            'id': animal.id,
            'name': animal.name,
            'species': animal.family.name if animal.family else "Unknown",
            'country': animal.country.name if animal.country else "Unknown",
            'receipt_date': animal.receipt_date,
            'birthday': animal.birthday,
            'facts': animal.facts,
            'photo_url': animal.photo.url if animal.photo else None,
            'feeding_info': feeding_info,
            'food_type': animal.food_type.food_name if animal.food_type else 'Not specified'
        })

    return render(request, 'employee/dashboard.html', {
        'rooms_data': rooms_data.values(),
        'employee_name': employee.name
    })

@login_required
@user_passes_test(is_visitor)
def visitor_dashboard(request):
    tickets = request.user.tickets.select_related('visit_date').order_by('-purchase_date')
    promocodes = request.user.promocodes.filter(used=False)
    
    return render(request, 'visitor/dashboard.html', {
        'tickets': tickets,
        'promocodes': promocodes,
        'visitor_name': request.user.get_full_name()
    })
    
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