from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponseNotFound
from django.contrib import messages
from django.utils import timezone
from .models import Animal, AnimalFamily, AnimalCountry, AnimalFoodType, Room
from employee.models import Employee

animal_not_found = "<h2>Animal not found</h2>"

def index(request):
    animals = Animal.objects.select_related(
        'family', 'room', 'food_type', 'country', 'employee'
    ).all()
    return render(request, "animal/index.html", {
        "animals": animals,
        "families": AnimalFamily.objects.all(),
        "rooms": Room.objects.all(),
        "food_types": AnimalFoodType.objects.all(),
        "countries": AnimalCountry.objects.all(),
        "employees": Employee.objects.all()
    })
    
def create(request):
    if request.method == "POST":
        try:
            animal = Animal()
            animal.name = request.POST.get("name")
            
            animal.family = get_object_or_none(AnimalFamily, request.POST.get("family"))
            animal.room = get_object_or_none(Room, request.POST.get("room"))
            animal.food_type = get_object_or_none(AnimalFoodType, request.POST.get("food_type"))
            animal.country = get_object_or_none(AnimalCountry, request.POST.get("country"))
            animal.employee = get_object_or_none(Employee, request.POST.get("employee"))
            
            animal.receipt_date = request.POST.get("recepient_date") or timezone.now()
            animal.birthday = request.POST.get("birthday") or timezone.now()
            animal.facts = request.POST.get("facts", "")
            
            if 'photo' in request.FILES:
                animal.photo = request.FILES['photo']
            
            animal.save()
            messages.success(request, "Animal created successfully!")
            return HttpResponseRedirect("/animals/")
            
        except Exception as e:
            messages.error(request, f"Error creating animal: {str(e)}")
            return render(request, "animal/create.html", {
                "families": AnimalFamily.objects.all(),
                "rooms": Room.objects.all(),
                "food_types": AnimalFoodType.objects.all(),
                "countries": AnimalCountry.objects.all(),
                "employees": Employee.objects.all()
            })

def edit(request, id):
    try:
        animal = Animal.objects.get(id=id)
        
        if request.method == "POST":
            try:
                animal.name = request.POST.get("name")
                animal.family = get_object_or_none(AnimalFamily, request.POST.get("family"))
                animal.room = get_object_or_none(Room, request.POST.get("room"))
                animal.food_type = get_object_or_none(AnimalFoodType, request.POST.get("food_type"))
                animal.country = get_object_or_none(AnimalCountry, request.POST.get("country"))
                animal.employee = get_object_or_none(Employee, request.POST.get("employee"))
                
                animal.receipt_date = request.POST.get("recepient_date") or animal.receipt_date
                animal.birthday = request.POST.get("birthday") or animal.birthday
                animal.facts = request.POST.get("facts", animal.facts)
                
                if 'photo' in request.FILES:
                    animal.photo = request.FILES['photo']
                
                animal.save()
                messages.success(request, "Animal updated successfully!")
                return HttpResponseRedirect("/animals/")
                
            except Exception as e:
                messages.error(request, f"Error updating animal: {str(e)}")
        
        return render(request, "animal/edit.html", {
            "animal": animal,
            "families": AnimalFamily.objects.all(),
            "rooms": Room.objects.all(),
            "food_types": AnimalFoodType.objects.all(),
            "countries": AnimalCountry.objects.all(),
            "employees": Employee.objects.all()
        })
        
    except Animal.DoesNotExist:
        return HttpResponseNotFound(animal_not_found)

def delete(request, id):
    try:
        animal = Animal.objects.get(id=id)
        animal.delete()
        messages.success(request, "Animal deleted successfully!")
    except Animal.DoesNotExist:
        messages.error(request, "Animal not found")
    return HttpResponseRedirect("/animals/")

def get_object_or_none(model, id):
    if id and id.isdigit():
        try:
            return model.objects.get(id=int(id))
        except model.DoesNotExist:
            return None
    return None