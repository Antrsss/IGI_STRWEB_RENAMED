from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User as AdmUser
from django.conf import settings
from phonenumber_field.modelfields import PhoneNumberField

class BaseModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
    
class EmployeePosition(BaseModel):
    name = models.CharField(max_length=50)
    info = models.TextField()

    def __str__(self):
        return self.name
        
class Employee(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        null=True,
        blank=True,
        related_name='employee')
    name = models.CharField(max_length=50)
    phone = PhoneNumberField(max_length=20, blank=True, null=True)
    email = models.EmailField()
    info = models.TextField()
    photo = models.ImageField(upload_to='photos/employee/', default=None, null=True)
    position = models.ForeignKey(EmployeePosition, on_delete=models.SET_NULL, null=True)

    def __str__(self):
       return self.user.username + ' employee'