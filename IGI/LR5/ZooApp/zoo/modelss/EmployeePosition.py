from django.db import models
from zoo.modelss.BaseModel import BaseModel


class EmployeePosition(BaseModel):
    name = models.CharField(max_length=50)
    info = models.TextField()

    def __str__(self):
        return self.name