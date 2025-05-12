from django.db import models
from django.contrib.auth.models import User as AdmUser
#from phonenumber_field.modelfields import PhoneNumberField
from zoo.modelss.BaseModel import BaseModel
from zoo.modelss.EmployeePosition import EmployeePosition
from zoo.modelss.Room import Room


class Employee(BaseModel):
    user = models.OneToOneField(AdmUser, on_delete=models.CASCADE, default=None, null=True, related_name='employee')
    name = models.CharField(max_length=50)
    #phone = PhoneNumberField()
    email = models.EmailField()
    info = models.TextField()
    photo = models.ImageField(upload_to='photos/news/', default=None, null=True)
    position = models.ForeignKey(EmployeePosition, on_delete=models.SET_NULL, related_query_name="news", null=True)

    #def __str__(self):
    #   return self.user.username + ' employee'