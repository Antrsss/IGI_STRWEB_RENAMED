from django.shortcuts import render, HttpResponseRedirect, HttpResponseNotFound
from ..pages_models import EmployeePositions

position_not_found = "<h2>Position not found</h2>"

def position_index(request):
    positions = EmployeePositions.objects.all()
    return render(request, "position/index.html", {"positions": positions})

def position_create(request):
    if request.method == "POST":
        position = EmployeePositions()
        position.name = request.POST.get("name")
        position.save()
    return HttpResponseRedirect("/positions/")

def position_edit(request, id):
    try:
        position = EmployeePositions.objects.get(id=id)
        if request.method == "POST":
            position.name = request.POST.get("name")
            position.save()
            return HttpResponseRedirect("/positions/")
        return render(request, "position/edit.html", {"position": position})
    except EmployeePositions.DoesNotExist:
        return HttpResponseNotFound(position_not_found)

def position_delete(request, id):
    try:
        position = EmployeePositions.objects.get(id=id)
        position.delete()
        return HttpResponseRedirect("/positions/")
    except EmployeePositions.DoesNotExist:
        return HttpResponseNotFound(position_not_found)