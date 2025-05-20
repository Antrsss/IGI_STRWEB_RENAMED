from django.urls import path
from .pages_views import pages_view, article_views, company_info_views, contact_views, faq_views, position_views, promocode_views, recall_views, vacancy_views

urlpatterns = [
    path('', pages_view.pages_index, name='pages'),
    path('articles/', article_views.article_index, name='articles'),
    path('company-info/', company_info_views.comany_info_index, name='comany-info'),
    path('contacts/', contact_views.contact_index, name='contacts'),
    path('faqs/', faq_views.faq_index, name='faqs'),
    path('positions/', position_views.position_index, name='positions'),
    path('promocodes/', promocode_views.promocode_index, name='promocodes'),
    path('recalls/', recall_views.recall_index, name='recalls'),
    path('vacancies/', vacancy_views.vacancy_index, name='vacancies'),
]