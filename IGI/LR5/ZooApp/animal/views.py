from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponseNotFound
from .models import Animal

animal_not_found = "<h2>Animal not found</h2>"


def index(request):
    animals = Animal.objects.all()
    return render(request, "animal/index.html", {"animals": animals})


def create(request):
    if request.method == "POST":
        animal = Animal()
        animal.name = request.POST.get("name")
        animal.family = request.POST.get("family")
        animal.receipt_date = request.POST.get("recepient_date")
        animal.room = request.POST.get("room")
        animal.birthday = request.POST.get("birthday")
        animal.employee = request.POST.get("employee")
        animal.facts = request.POST.get("facts")
        animal.food_type = request.POST.get("food_type")
        animal.country = request.POST.get("country")
        animal.photo = request.POST.get("photo")
        animal.save()
    return HttpResponseRedirect("/")


def edit(request, id):
    try:
        animal = Animal.objects.get(id=id)
        
        if request.method == "POST":
            animal.name = request.POST.get("name")
            animal.family = request.POST.get("family")
            animal.receipt_date = request.POST.get("recepient_date")
            animal.room = request.POST.get("room")
            animal.birthday = request.POST.get("birthday")
            animal.employee = request.POST.get("employee")
            animal.facts = request.POST.get("facts")
            animal.food_type = request.POST.get("food_type")
            animal.country = request.POST.get("country")
            animal.photo = request.POST.het("photo")
            animal.save()
        else:
            return render(request, "animal/edit.html", {"animal": animal})
    except Animal.DoesNotExist:
        return HttpResponseNotFound(animal_not_found)
    

def delete(request, id):
    try:
        animal = Animal.objects.get(id=id)
        animal.delete()
        return HttpResponseRedirect("/")
    except Animal.DoesNotExist:
        return HttpResponseNotFound(animal_not_found)