from django.db import models
from django.utils import timezone
from zoo.modelss.Employee import Employee
from zoo.modelss.Room import Room
from zoo.modelss.BaseModel import BaseModel
from zoo.modelss.AnimalFamily import AnimalFamily
from zoo.modelss.Country import Country
from zoo.modelss.FoodType import FoodType


class Animal(BaseModel):
    name = models.CharField(max_length=50)
    family = models.ForeignKey(AnimalFamily, on_delete=models.SET_NULL, related_query_name="family", null=True)
    receipt_date = models.DateTimeField(default=timezone.now)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, related_query_name="animals", null=True, related_name="animals")
    birthday = models.DateTimeField(default=timezone.now)
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, related_query_name="news", null=True)
    facts = models.TextField()
    food_type = models.ForeignKey(FoodType, on_delete=models.SET_NULL, related_query_name="food_type", null=True)
    country = models.ForeignKey(Country, on_delete=models.SET_NULL, related_query_name="country", null=True)
    photo = models.ImageField(upload_to='photos/animals/')

    def __str__(self):
        return self.name + ' ' + self.room.name