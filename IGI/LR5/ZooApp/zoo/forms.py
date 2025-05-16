from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.contrib.auth.forms import AuthenticationForm
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import TicketType, ExtraService, PromoCode, Ticket

User = get_user_model()

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        if commit:
            user.save()
        return user

class CustomAuthenticationForm(AuthenticationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_cache = None

class TicketPurchaseForm(forms.ModelForm):
    visit_date = forms.DateField(
        widget=forms.DateInput(attrs={'type': 'date'})
    )
    promo_code = forms.CharField(required=False)
    
    class Meta:
        model = Ticket
        fields = ['ticket_type', 'visit_date', 'services']
        widgets = {
            'services': forms.CheckboxSelectMultiple
        }
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['visit_date'].widget.attrs['min'] = timezone.now().date().isoformat()
    
    def clean_visit_date(self):
        visit_date = self.cleaned_data['visit_date']
        if visit_date < timezone.now().date():
            raise ValidationError("Visit date cannot be in the past")
        return visit_date
    
    def clean_promo_code(self):
        promo_code = self.cleaned_data.get('promo_code')
        if promo_code:
            try:
                return PromoCode.objects.get(
                    code=promo_code,
                    is_active=True,
                    expiry_date__gte=timezone.now().date()
                )
            except PromoCode.DoesNotExist:
                raise ValidationError("Invalid or expired promo code")
        return None
    ticket_type = forms.ModelChoiceField(
        queryset=TicketType.objects.all(),
        label="Ticket Type",
        widget=forms.Select(attrs={'class': 'form-control'})
    )
    visit_date = forms.DateField(
        label="Visit Date",
        widget=forms.DateInput(attrs={
            'type': 'date',
            'class': 'form-control',
            'min': timezone.now().date().isoformat()
        })
    )
    services = forms.ModelMultipleChoiceField(
        queryset=ExtraService.objects.all(),
        widget=forms.CheckboxSelectMultiple(),
        required=False,
        label="Extra Services"
    )
    promo_code = forms.CharField(
        required=False,
        label="Promo Code",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter promo code if you have one'
        })
    )

    def __init__(self, *args, **kwargs):
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
        
        # Динамически обновляем минимальную дату при каждой инициализации формы
        self.fields['visit_date'].widget.attrs['min'] = timezone.now().date().isoformat()

    def clean_visit_date(self):
        visit_date = self.cleaned_data['visit_date']
        if visit_date < timezone.now().date():
            raise ValidationError("Visit date cannot be in the past")
        return visit_date

    def clean_promo_code(self):
        promo_code = self.cleaned_data['promo_code']
        if promo_code:
            try:
                promo = PromoCode.objects.get(
                    code=promo_code,
                    is_active=True,
                    expiry_date__gte=timezone.now().date()
                )
                if self.user and not self.user.promocodes.filter(id=promo.id).exists():
                    raise ValidationError("This promo code is not available for you")
                return promo
            except PromoCode.DoesNotExist:
                raise ValidationError("Invalid or expired promo code")
        return None

    def get_price(self):
        data = self.cleaned_data
        ticket_type = data['ticket_type']
        visit_date = data['visit_date']
        
        # Определяем цену (будний/выходной день)
        if visit_date.weekday() in (5, 6):  # Суббота или воскресенье
            base_price = ticket_type.weekend_price
        else:
            base_price = ticket_type.weekday_price
        
        # Добавляем стоимость дополнительных услуг
        services_price = sum(service.price for service in data['services'])
        
        # Применяем скидку по промокоду
        total_price = base_price + services_price
        if data['promo_code']:
            discount = data['promo_code'].discount
            total_price *= (1 - discount / 100)
        
        return {
            'base_price': base_price,
            'services_price': services_price,
            'discount': data['promo_code'].discount if data['promo_code'] else 0,
            'total_price': total_price
        }