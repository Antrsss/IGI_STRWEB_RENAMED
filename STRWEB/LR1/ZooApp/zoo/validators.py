from django.core.exceptions import ValidationError
import re
from datetime import date

def validate_belarus_phone_number(value):
    pattern = r'^\+375\s\((29|25|44|33)\)\s\d{3}-\d{2}-\d{2}$'
    if not re.match(pattern, value):
        raise ValidationError(
            'Phone number must be in format +375 (29) XXX-XX-XX'
        )

def validate_age(value):
    min_age = 18
    today = date.today()
    age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
    if age < min_age:
        raise ValidationError(f'You must be at least {min_age} years old to register')