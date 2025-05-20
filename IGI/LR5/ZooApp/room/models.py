from django.db import models
from django.utils import timezone

class BaseModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        
class Room(BaseModel):
    name = models.CharField(max_length=50)
    number = models.SmallIntegerField()
    has_swimming = models.BooleanField()
    has_heating = models.BooleanField()
    square = models.FloatField()

    def __str__(self):
        return self.name