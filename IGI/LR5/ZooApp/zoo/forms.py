from django import forms
from zoo.pages_models import EmployeePositions

class EmployeePositionForm(forms.ModelForm):
    class Meta:
        model = EmployeePositions
        fields = ['name']