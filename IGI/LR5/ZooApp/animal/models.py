from django.db import models
from django.utils import timezone
from room.models import Room
from employee.models import Employee
import datetime

class BaseModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True    

class AnimalFamily(BaseModel):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name

class AnimalCountry(BaseModel):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name
    
class AnimalFoodType(BaseModel):
    food_name = models.CharField(max_length=20)
    portion = models.FloatField(default=0.0)
    times = models.IntegerField(default=0)

    def __str__(self):
        return self.food_name + ' ' + str(self.portion) + 'kg ' + str(self.times) + ' times a day'

class Animal(BaseModel):
    name = models.CharField(max_length=50)
    family = models.ForeignKey(AnimalFamily, on_delete=models.SET_NULL, related_query_name="family", null=True)
    receipt_date = models.DateTimeField(default=timezone.now)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, related_query_name="animals", null=True, related_name="animals")
    birthday = models.DateTimeField(default=timezone.now)
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, related_query_name="news", null=True)
    facts = models.TextField()
    food_type = models.ForeignKey(AnimalFoodType, on_delete=models.SET_NULL, related_query_name="food_type", null=True)
    country = models.ForeignKey(AnimalCountry, on_delete=models.SET_NULL, related_query_name="country", null=True)
    photo = models.ImageField(upload_to='photos/animals/')

    def __str__(self):
        if self.room:
            return f"{self.name} {self.room.name}"
        return self.name