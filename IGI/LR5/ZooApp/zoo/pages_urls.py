from django.urls import path
from .pages_views import (
    pages_view, 
    article_views, 
    company_info_views, 
    contact_views, 
    faq_views, 
    position_views, 
    promocode_views, 
    recall_views, 
    vacancy_views,
    faq_views
)

urlpatterns = [
    path('', pages_view.pages_index, name='pages'),
    path('articles/', article_views.article_index, name='articles'),
    path('company-info/', company_info_views.company_info_index, name='company-info'),
    path('contacts/', contact_views.contact_index, name='contacts'),
    path('faqs/', faq_views.faq_index, name='faqs'),
    path('positions/', position_views.position_index, name='positions'),
    path('promocodes/', promocode_views.promocode_index, name='promocodes'),
    path('recalls/', recall_views.recall_index, name='recalls'),
    path('vacancies/', vacancy_views.vacancy_index, name='vacancies'),
    path('faqs/', faq_views.faq_index, name="faq_index"),
    path('faqs/ask/', faq_views.faq_ask, name="faq_ask"),
    path('faqs/<int:id>/answer/', faq_views.faq_answer, name="faq_answer"),
]