from django import forms
from zoo.models import EmployeePositions

class EmployeePositionForm(forms.ModelForm):
    class Meta:
        model = EmployeePositions
        fields = ['name']  # Все поля, которые нужно редактировать