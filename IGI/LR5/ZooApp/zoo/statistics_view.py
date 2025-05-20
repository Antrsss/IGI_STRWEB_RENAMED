from django.db.models import Count, Sum
import statistics
from .models import Ticket, TicketType, User
from django.shortcuts import render
from django.db.models import Case, When, F, DecimalField, Sum, Value
from django.db.models.functions import Concat
import matplotlib.pyplot as plt
import io
import base64

def statistics_view(request):
    visitors = User.objects.filter(is_visitor=True).annotate(
        full_name=Concat('first_name', Value(' '), 'last_name')
    ).order_by('full_name')
    
    visitor_ages = [user.age for user in User.objects.filter(is_visitor=True) if user.age is not None]
    
    age_stats = {
        'mean': statistics.mean(visitor_ages) if visitor_ages else 0,
        'median': statistics.median(visitor_ages) if visitor_ages else 0
    }
    
    tickets = Ticket.objects.annotate(
        actual_price=Case(
            When(visit_date__week_day__in=[1, 7], then=F('ticket_type__weekend_price')),
            default=F('ticket_type__weekday_price'),
            output_field=DecimalField()
        )
    )
    
    total_sales = tickets.aggregate(total=Sum('actual_price'))['total'] or 0
    
    ticket_prices = list(tickets.values_list('actual_price', flat=True))
    
    sales_stats = {
        'mean': statistics.mean(ticket_prices) if ticket_prices else 0,
        'median': statistics.median(ticket_prices) if ticket_prices else 0,
        'mode': statistics.mode(ticket_prices) if ticket_prices else 0
    }
    
    ticket_stats = tickets.values('ticket_type__name').annotate(
        count=Count('id'),
        total=Sum('actual_price')
    ).order_by('-total')
    
    popular_ticket = ticket_stats.order_by('-count').first()
    profitable_ticket = ticket_stats.first()
    context = {
        'visitors': visitors,
        'age_stats': age_stats,
        'total_sales': total_sales,
        'sales_stats': sales_stats,
        'popular_ticket': popular_ticket,
        'profitable_ticket': profitable_ticket
    }
    return render(request, 'statistics.html', context)

def ticket_statistics_view(request):
    # Get data from database
    ticket_types = TicketType.objects.all()
    counts = [Ticket.objects.filter(ticket_type=t).count() for t in ticket_types]
    labels = [t.name for t in ticket_types]
    
    # Combine labels and counts for the template
    ticket_data = zip(labels, counts)

    # Create the chart
    plt.figure(figsize=(10, 6))
    plt.bar(labels, counts)
    plt.title('Ticket Type Distribution')
    plt.ylabel('Quantity')
    plt.xlabel('Ticket Type')
    plt.tight_layout()

    # Convert to image
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png')
    buffer.seek(0)
    image_png = buffer.getvalue()
    buffer.close()

    # Encode for HTML
    graphic = base64.b64encode(image_png)
    graphic = graphic.decode('utf-8')

    return render(request, 'stats.html', {
        'graphic': graphic,
        'ticket_data': ticket_data
    })