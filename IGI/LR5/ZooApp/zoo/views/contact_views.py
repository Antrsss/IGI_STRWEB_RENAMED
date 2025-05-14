from django.shortcuts import render, HttpResponseRedirect, HttpResponseNotFound
from ..pages_models import Contacts, EmployeePositions

contact_not_found = "<h2>Contact not found</h2>"

def contact_index(request):
    contacts = Contacts.objects.filter(is_active=True)
    return render(request, "contact/index.html", {"contacts": contacts})

def contact_create(request):
    if request.method == "POST":
        contact = Contacts()
        contact.name = request.POST.get("name")
        contact.position_id = request.POST.get("position")
        contact.phone = request.POST.get("phone")
        contact.email = request.POST.get("email")
        contact.description = request.POST.get("description")
        contact.photo = request.FILES.get("photo")
        contact.is_active = 'is_active' in request.POST
        contact.save()
    return HttpResponseRedirect("/contacts/")

def contact_edit(request, id):
    try:
        contact = Contacts.objects.get(id=id)
        if request.method == "POST":
            contact.name = request.POST.get("name")
            contact.position_id = request.POST.get("position")
            contact.phone = request.POST.get("phone")
            contact.email = request.POST.get("email")
            contact.description = request.POST.get("description")
            if request.FILES.get("photo"):
                contact.photo = request.FILES.get("photo")
            contact.is_active = 'is_active' in request.POST
            contact.save()
            return HttpResponseRedirect("/contacts/")
        return render(request, "contact/edit.html", {
            "contact": contact,
            "positions": EmployeePositions.objects.all()
        })
    except Contacts.DoesNotExist:
        return HttpResponseNotFound(contact_not_found)

def contact_delete(request, id):
    try:
        contact = Contacts.objects.get(id=id)
        contact.delete()
        return HttpResponseRedirect("/contacts/")
    except Contacts.DoesNotExist:
        return HttpResponseNotFound(contact_not_found)