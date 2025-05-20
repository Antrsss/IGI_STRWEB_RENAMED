# context_processors.py
from django.utils import timezone
import pytz
import calendar
from datetime import datetime

def time_info(request):
    if request.user.is_authenticated:
        user_tz = pytz.timezone(request.user.timezone)
    else:
        user_tz = pytz.timezone('UTC')
    
    now_utc = timezone.now()
    now_user = now_utc.astimezone(user_tz)
    
    return {
        'current_date_utc': now_utc,
        'current_date_user': now_user,
        'user_timezone': user_tz.zone,
        'text_calendar': calendar.month(now_user.year, now_user.month)
    }