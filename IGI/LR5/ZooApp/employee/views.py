from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponseRedirect, HttpResponseNotFound
from django.contrib import messages
from django.contrib.auth.models import User
from .models import Employee, EmployeePosition

employee_not_found = "<h2>Employee not found</h2>"

def index(request):
    employees = Employee.objects.select_related('user', 'position').all()
    return render(request, "employee/index.html", {
        "employees": employees,
        "positions": EmployeePosition.objects.all(),
        "users": User.objects.filter(employee__isnull=True)
    })

def create(request):
    if request.method == "POST":
        try:
            employee = Employee()
            employee.name = request.POST.get("name")
            employee.email = request.POST.get("email", "")
            employee.info = request.POST.get("info", "")
            
            user_id = request.POST.get("user")
            if user_id and user_id.isdigit():
                employee.user = get_object_or_404(User, id=int(user_id))
            
            position_id = request.POST.get("position")
            if position_id and position_id.isdigit():
                employee.position = get_object_or_404(EmployeePosition, id=int(position_id))
            
            phone = request.POST.get("phone")
            if phone:
                employee.phone = phone
            
            if 'photo' in request.FILES:
                employee.photo = request.FILES['photo']
            
            employee.save()
            messages.success(request, "Employee created successfully!")
            return redirect("employees:index")
            
        except Exception as e:
            messages.error(request, f"Error creating employee: {str(e)}")
    
    return HttpResponseRedirect("/employees/")

def delete(request, id):
    try:
        employee = Employee.objects.get(id=id)
        employee.delete()
        messages.success(request, "Employee deleted successfully!")
    except Employee.DoesNotExist:
        messages.error(request, "Employee not found")
    return HttpResponseRedirect("/employees/")