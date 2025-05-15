from django.db import models
from django.utils import timezone
from django.conf import settings

class Article(models.Model):
    """News/articles for main and news pages"""
    title = models.CharField(max_length=200, verbose_name="Header")
    short_description = models.CharField(max_length=200, verbose_name="Summary")
    full_text = models.TextField(verbose_name="Full text")
    image = models.ImageField(upload_to='articles/', verbose_name="Image")
    pub_date = models.DateTimeField(default=timezone.now, verbose_name="Date published")
    is_published = models.BooleanField(default=True, verbose_name="Published")

    class Meta:
        verbose_name = "News"
        verbose_name_plural = "News"
        ordering = ['-pub_date']

    def __str__(self):
        return self.title

class CompanyInfo(models.Model):
    """Info about company"""
    about_text = models.TextField(verbose_name="About company")
    logo = models.ImageField(upload_to='company/', verbose_name="Logotype")
    history = models.TextField(blank=True, verbose_name="History")
    requisites = models.TextField(verbose_name="Props")
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Info about company"
        verbose_name_plural = "Info about company"

    def __str__(self):
        return "Info about company"

class FAQ(models.Model):
    """Terms & frequent questions dictionary"""
    question = models.CharField(max_length=255, verbose_name="Question")
    answer = models.TextField(verbose_name="Answer")
    date_added = models.DateField(auto_now_add=True, verbose_name="Date added")

    class Meta:
        verbose_name = "QA"
        verbose_name_plural = "Terms dictionary"
        ordering = ['-date_added']

    def __str__(self):
        return self.question

class EmployeePositions(models.Model):
    """Employees positions"""
    name = models.CharField(max_length=100, verbose_name="Position")

    class Meta:
        verbose_name = "Position"
        verbose_name_plural = "Position"

    def __str__(self):
        return self.name

class Contacts(models.Model):
    """Employees to contact"""
    name = models.CharField(max_length=100, verbose_name="Name")
    photo = models.ImageField(upload_to='contacts/', verbose_name="Photo")
    position = models.ForeignKey(EmployeePositions, on_delete=models.SET_NULL, 
                               null=True, verbose_name="Position")
    phone = models.CharField(max_length=20, verbose_name="Phone")
    email = models.EmailField(verbose_name="Email")
    description = models.TextField(verbose_name="Description")
    is_active = models.BooleanField(default=True, verbose_name="Active")

    class Meta:
        verbose_name = "Contact"
        verbose_name_plural = "Contacts"

    def __str__(self):
        return f"{self.name} ({self.position})"
    
    
class PrivacyPolicy(models.Model):
    """Privacy policy"""

    def __str__(self):
        return "Privacy policy"
    

class Vacancy(models.Model):
    """Zoo vacancies"""
    title = models.CharField(max_length=200, verbose_name="Vacancy name")
    description = models.TextField(verbose_name="Description")
    requirements = models.TextField(verbose_name="Requerments")
    salary = models.CharField(max_length=100, blank=True, verbose_name="Salary")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Vacancy"
        verbose_name_plural = "Vacancy"
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class Review(models.Model):
    """Visitors' recalls"""
    RATING_CHOICES = [
        (1, '1 - Awful'),
        (2, '2 - Bad'),
        (3, '3 - OK'),
        (4, '4 - Good'),
        (5, '5 - Perfect'),
    ]
    
    author_name = models.CharField(max_length=100, verbose_name="Author name")
    rating = models.IntegerField(choices=RATING_CHOICES, verbose_name="Mark")
    text = models.TextField(verbose_name="Recall text")
    pub_date = models.DateTimeField(auto_now_add=True, verbose_name="Date published")
    is_published = models.BooleanField(default=False, verbose_name="Published")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, 
                           null=True, blank=True, verbose_name="User")

    class Meta:
        verbose_name = "Recall"
        verbose_name_plural = "Recall"
        ordering = ['-pub_date']

    def __str__(self):
        return f"Recall by {self.author_name} ({self.rating}/5)"

class PromoCode(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name="Code")
    description = models.TextField(verbose_name="Description")
    discount = models.PositiveIntegerField(verbose_name="Sale size (%)")
    is_active = models.BooleanField(default=True, verbose_name="Active")
    created_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateField(verbose_name="Expiry date")

    class Meta:
        verbose_name = "Promocode"
        verbose_name_plural = "Promocodes"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} (-{self.discount}%)"