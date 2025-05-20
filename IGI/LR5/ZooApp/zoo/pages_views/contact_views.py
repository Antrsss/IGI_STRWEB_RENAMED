from django.shortcuts import render, get_object_or_404
from django.http import HttpResponseRedirect, HttpResponseNotFound
from employee.models import Employee, EmployeePosition
from django.urls import reverse

employee_not_found = "<h2>Employee not found</h2>"

def contact_index(request):
    contacts = Employee.objects.filter(user__is_active=True)
    return render(request, "pages/contacts_list.html", {"contacts": contacts})

def contact_create(request):
    if request.method == "POST":
        contact = Employee()
        contact.name = request.POST.get("name")
        contact.position_id = request.POST.get("position")
        contact.phone = request.POST.get("phone")
        contact.email = request.POST.get("email")
        contact.info = request.POST.get("info")
        contact.photo = request.FILES.get("photo")
        contact.save()
        return HttpResponseRedirect(reverse("contacts"))  # name='contacts' в urls.py
    return render(request, "pages/contact_create.html", {
        "positions": EmployeePosition.objects.all()
    })

def contact_edit(request, id):
    contact = get_object_or_404(Employee, id=id)
    if request.method == "POST":
        contact.name = request.POST.get("name")
        contact.position_id = request.POST.get("position")
        contact.phone = request.POST.get("phone")
        contact.email = request.POST.get("email")
        contact.info = request.POST.get("info")
        if request.FILES.get("photo"):
            contact.photo = request.FILES.get("photo")
        contact.save()
        return HttpResponseRedirect(reverse("contacts"))
    return render(request, "pages/contact_edit.html", {
        "contact": contact,
        "positions": EmployeePosition.objects.all()
    })

def contact_delete(request, id):
    try:
        contact = Employee.objects.get(id=id)
        contact.delete()
        return HttpResponseRedirect(reverse("contacts"))
    except Employee.DoesNotExist:
        return HttpResponseNotFound(employee_not_found)
