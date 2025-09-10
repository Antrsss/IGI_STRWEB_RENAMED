from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponseNotFound
from employee.models import EmployeePosition

position_not_found = "<h2>Position not found</h2>"

def position_index(request):
    positions = EmployeePosition.objects.all()
    return render(request, "pages/positions_list.html", {"positions": positions})

def position_create(request):
    if request.method == "POST":
        position = EmployeePosition()
        position.name = request.POST.get("name")
        position.save()
    return HttpResponseRedirect("/positions/")

def position_edit(request, id):
    try:
        position = EmployeePosition.objects.get(id=id)
        if request.method == "POST":
            position.name = request.POST.get("name")
            position.save()
            return HttpResponseRedirect("/positions/")
        return render(request, "position/edit.html", {"position": position})
    except EmployeePosition.DoesNotExist:
        return HttpResponseNotFound(position_not_found)

def position_delete(request, id):
    try:
        position = EmployeePosition.objects.get(id=id)
        position.delete()
        return HttpResponseRedirect("/positions/")
    except EmployeePosition.DoesNotExist:
        return HttpResponseNotFound(position_not_found)