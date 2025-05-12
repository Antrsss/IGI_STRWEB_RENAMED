from django.db import models
from zoo.modelss.BaseModel import BaseModel


class Room(BaseModel):
    name = models.CharField(max_length=50)
    number = models.SmallIntegerField()
    has_swimming = models.BooleanField()
    has_heating = models.BooleanField()
    square = models.FloatField()

    def __str__(self):
        return self.name