from django.shortcuts import render, HttpResponseRedirect, HttpResponseNotFound
from ..models import Vacancy

vacancy_not_found = "<h2>Vacancy not found</h2>"

def vacancy_index(request):
    vacancies = Vacancy.objects.filter(is_active=True)
    return render(request, "vacancy/index.html", {"vacancies": vacancies})

def vacancy_create(request):
    if request.method == "POST":
        vacancy = Vacancy()
        vacancy.title = request.POST.get("title")
        vacancy.description = request.POST.get("description")
        vacancy.requirements = request.POST.get("requirements")
        vacancy.salary = request.POST.get("salary")
        vacancy.is_active = 'is_active' in request.POST
        vacancy.save()
    return HttpResponseRedirect("/vacancies/")

def vacancy_edit(request, id):
    try:
        vacancy = Vacancy.objects.get(id=id)
        if request.method == "POST":
            vacancy.title = request.POST.get("title")
            vacancy.description = request.POST.get("description")
            vacancy.requirements = request.POST.get("requirements")
            vacancy.salary = request.POST.get("salary")
            vacancy.is_active = 'is_active' in request.POST
            vacancy.save()
            return HttpResponseRedirect("/vacancies/")
        return render(request, "vacancy/edit.html", {"vacancy": vacancy})
    except Vacancy.DoesNotExist:
        return HttpResponseNotFound(vacancy_not_found)

def vacancy_delete(request, id):
    try:
        vacancy = Vacancy.objects.get(id=id)
        vacancy.delete()
        return HttpResponseRedirect("/vacancies/")
    except Vacancy.DoesNotExist:
        return HttpResponseNotFound(vacancy_not_found)