from zoo.modelss import BaseModel
from django.db import models

class Country(BaseModel):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name