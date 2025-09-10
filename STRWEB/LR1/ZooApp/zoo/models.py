from django.db import models
from django.contrib.auth.models import AbstractUser
from phonenumber_field.modelfields import PhoneNumberField
from employee.models import EmployeePosition
from .pages_models import PromoCode
from datetime import date
import pytz
from django.utils import timezone
from .validators import validate_belarus_phone_number

TIMEZONE_CHOICES = [(tz, tz) for tz in pytz.all_timezones]

class BaseModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True 

class User(AbstractUser):
    is_employee = models.BooleanField(default=False)
    is_visitor = models.BooleanField(default=False)
    phone = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        validators=[validate_belarus_phone_number],
        help_text="Формат: +375 (29) XXX-XX-XX"
    )
    position = models.ForeignKey(EmployeePosition, on_delete=models.SET_NULL, null=True, blank=True)
    birth_date = models.DateField(null=True, blank=True)
    timezone = models.CharField(
        max_length=100,
        choices=TIMEZONE_CHOICES,
        default='UTC'
    )
    
    @property
    def age(self):
        if self.birth_date:
            today = date.today()
            return today.year - self.birth_date.year - (
                (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
            )
        return None

class TicketType(BaseModel):
    name = models.CharField(max_length=100)
    weekday_price = models.DecimalField(max_digits=8, decimal_places=2)
    weekend_price = models.DecimalField(max_digits=8, decimal_places=2)
    
    def __str__(self):
        return f"{self.name} (Weekday: {self.weekday_price}, Weekend: {self.weekend_price})"

class ExtraService(BaseModel):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField()
    
    def __str__(self):
        return f"{self.name} - ${self.price}"

class Ticket(BaseModel):
    visitor = models.ForeignKey(User, on_delete=models.CASCADE)
    ticket_type = models.ForeignKey(TicketType, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)
    visit_date = models.DateField()
    promo_code = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True, blank=True)
    services = models.ManyToManyField(ExtraService)
    
    def __str__(self):
        return f"Ticket #{self.id} - {self.visitor.username} ({self.visit_date})"