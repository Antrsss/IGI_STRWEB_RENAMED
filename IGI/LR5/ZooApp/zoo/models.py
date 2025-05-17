from django.db import models
from django.contrib.auth.models import AbstractUser, Group, Permission
from phonenumber_field.modelfields import PhoneNumberField
from employee.models import EmployeePosition
from .pages_models import PromoCode

class User(AbstractUser):
    is_employee = models.BooleanField(default=False)
    is_visitor = models.BooleanField(default=False)
    phone = PhoneNumberField(max_length=20, blank=True, null=True)
    position = models.ForeignKey(EmployeePosition, on_delete=models.SET_NULL, null=True)
    
    groups = models.ManyToManyField(
        Group,
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='zoo_user_set',  # Уникальное имя
        related_query_name='zoo_user'
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='zoo_user_set',  # Уникальное имя
        related_query_name='zoo_user'
    )

class TicketType(models.Model):
    name = models.CharField(max_length=100)
    weekday_price = models.DecimalField(max_digits=8, decimal_places=2)
    weekend_price = models.DecimalField(max_digits=8, decimal_places=2)
    
    def __str__(self):
        return f"{self.name} (Weekday: {self.weekday_price}, Weekend: {self.weekend_price})"

class ExtraService(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    description = models.TextField()
    
    def __str__(self):
        return f"{self.name} - ${self.price}"

class Ticket(models.Model):
    visitor = models.ForeignKey(User, on_delete=models.CASCADE)
    ticket_type = models.ForeignKey(TicketType, on_delete=models.CASCADE)
    purchase_date = models.DateTimeField(auto_now_add=True)
    visit_date = models.DateField()
    promo_code = models.ForeignKey(PromoCode, on_delete=models.SET_NULL, null=True)
    services = models.ManyToManyField(ExtraService)
    
    def __str__(self):
        return f"Ticket #{self.id} - {self.visitor.username} ({self.visit_date})"