from django.db import models
from django.utils import timezone
from zoo.modelss.Animal import Animal
from zoo.modelss.AnimalFamily import AnimalFamily
from zoo.modelss.Room import Room
from zoo.modelss.Employee import Employee
from zoo.modelss.EmployeePosition import EmployeePosition
from zoo.modelss.Country import Country
from zoo.modelss.FoodType import FoodType


class Article(models.Model):
    """Модель новостей/статей для главной страницы и раздела новостей"""
    title = models.CharField(max_length=200, verbose_name="Заголовок")
    short_description = models.CharField(max_length=200, verbose_name="Краткое описание")
    full_text = models.TextField(verbose_name="Полный текст")
    image = models.ImageField(upload_to='articles/', verbose_name="Изображение")
    pub_date = models.DateTimeField(default=timezone.now, verbose_name="Дата публикации")
    is_published = models.BooleanField(default=True, verbose_name="Опубликовано")

    class Meta:
        verbose_name = "Новость"
        verbose_name_plural = "Новости"
        ordering = ['-pub_date']

    def __str__(self):
        return self.title

class CompanyInfo(models.Model):
    """Информация о компании"""
    about_text = models.TextField(verbose_name="О компании")
    logo = models.ImageField(upload_to='company/', verbose_name="Логотип")
    history = models.TextField(blank=True, verbose_name="История")
    requisites = models.TextField(verbose_name="Реквизиты")
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Информация о компании"
        verbose_name_plural = "Информация о компании"

    def __str__(self):
        return "Информация о компании"

class FAQ(models.Model):
    """Словарь терминов и часто задаваемых вопросов"""
    question = models.CharField(max_length=255, verbose_name="Вопрос")
    answer = models.TextField(verbose_name="Ответ")
    date_added = models.DateField(auto_now_add=True, verbose_name="Дата добавления")

    class Meta:
        verbose_name = "Вопрос-ответ"
        verbose_name_plural = "Словарь терминов"
        ordering = ['-date_added']

    def __str__(self):
        return self.question

class EmployeePositions(models.Model):
    """Должности сотрудников"""
    name = models.CharField(max_length=100, verbose_name="Должность")

    class Meta:
        verbose_name = "Должность"
        verbose_name_plural = "Должности"

    def __str__(self):
        return self.name

class Employees(models.Model):
    """Сотрудники для страницы контактов"""
    name = models.CharField(max_length=100, verbose_name="Имя")
    photo = models.ImageField(upload_to='employees/', verbose_name="Фото")
    position = models.ForeignKey(EmployeePositions, on_delete=models.SET_NULL, 
                               null=True, verbose_name="Должность")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    email = models.EmailField(verbose_name="Email")
    description = models.TextField(verbose_name="Описание")
    is_active = models.BooleanField(default=True, verbose_name="Активен")

    class Meta:
        verbose_name = "Сотрудник"
        verbose_name_plural = "Сотрудники"

    def __str__(self):
        return f"{self.name} ({self.position})"

class Vacancy(models.Model):
    """Вакансии зоопарка"""
    title = models.CharField(max_length=200, verbose_name="Название вакансии")
    description = models.TextField(verbose_name="Описание")
    requirements = models.TextField(verbose_name="Требования")
    salary = models.CharField(max_length=100, blank=True, verbose_name="Зарплата")
    is_active = models.BooleanField(default=True, verbose_name="Активна")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Вакансия"
        verbose_name_plural = "Вакансии"
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class Review(models.Model):
    """Отзывы посетителей"""
    RATING_CHOICES = [
        (1, '1 - Ужасно'),
        (2, '2 - Плохо'),
        (3, '3 - Нормально'),
        (4, '4 - Хорошо'),
        (5, '5 - Отлично'),
    ]
    
    author_name = models.CharField(max_length=100, verbose_name="Имя автора")
    rating = models.IntegerField(choices=RATING_CHOICES, verbose_name="Оценка")
    text = models.TextField(verbose_name="Текст отзыва")
    pub_date = models.DateTimeField(auto_now_add=True, verbose_name="Дата публикации")
    is_published = models.BooleanField(default=False, verbose_name="Опубликовано")
    user = models.ForeignKey('auth.User', on_delete=models.SET_NULL, 
                           null=True, blank=True, verbose_name="Пользователь")

    class Meta:
        verbose_name = "Отзыв"
        verbose_name_plural = "Отзывы"
        ordering = ['-pub_date']

    def __str__(self):
        return f"Отзыв от {self.author_name} ({self.rating}/5)"

class PromoCode(models.Model):
    """Промокоды и купоны"""
    code = models.CharField(max_length=50, unique=True, verbose_name="Код")
    description = models.TextField(verbose_name="Описание")
    discount = models.PositiveIntegerField(verbose_name="Размер скидки (%)")
    is_active = models.BooleanField(default=True, verbose_name="Активен")
    created_at = models.DateTimeField(auto_now_add=True)
    expiry_date = models.DateField(verbose_name="Срок действия")

    class Meta:
        verbose_name = "Промокод"
        verbose_name_plural = "Промокоды"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} (-{self.discount}%)"

class PrivacyPolicy(models.Model):
    """Политика конфиденциальности"""
    content = models.TextField(verbose_name="Текст политики")
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Политика конфиденциальности"
        verbose_name_plural = "Политика конфиденциальности"

    def __str__(self):
        return "Политика конфиденциальности"