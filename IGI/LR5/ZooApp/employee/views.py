from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponseNotFound
from .models import Employee


employee_not_found = "<h2>Employee not found</h2>"

def index(request):
    employees = Employee.objects.all()
    return render(request, "employee/index.html", {"employees": employees})


def create(request):
    if request.method == "POST":
        employee = Employee()
        employee.user = request.POST.get("user")
        employee.name = request.POST.get("name")
        employee.email = request.POST.get("email")
        employee.info = request.POST.get("info")
        employee.photo = request.POST.get("photo")
        employee.position = request.POST.get("position")
        employee.save()
    return HttpResponseRedirect("/")


def edit(request, id):
    try:
        employee = Employee.objects.get(id=id)
        
        if request.method == "POST":
            employee.user = request.POST.get("user")
            employee.name = request.POST.get("name")
            employee.email = request.POST.get("email")
            employee.info = request.POST.get("info")
            employee.photo = request.POST.get("photo")
            employee.position = request.POST.get("position")
            employee.save()
        else:
            return render(request, "employee/edit.html", {"employee": employee})
    except Employee.DoesNotExist:
        return HttpResponseNotFound(employee_not_found)
    
    
def delete(request, id):
    try:
        employee = Employee.objects.get(id=id)
        employee.delete()
        return HttpResponseRedirect("/")
    except Employee.DoesNotExist:
        return HttpResponseNotFound(employee_not_found)