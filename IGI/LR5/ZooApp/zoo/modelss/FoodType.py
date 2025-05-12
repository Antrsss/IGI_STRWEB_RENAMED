from django.db import models
import datetime
from zoo.modelss.BaseModel import BaseModel


class FoodType(BaseModel):
    food_name = models.CharField(max_length=20)
    portion = models.FloatField(default=0.0)
    time = models.TimeField(default=datetime.time)

    def __str__(self):
        return self.food_name.name + ' ' + str(self.portion) + 'kg at ' + str(self.time)