from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponseNotFound
from .models import Room


room_not_found = "<h2>Room not found</h2>"

def index(request):
    rooms = Room.objects.all()
    return render(request, "room/index.html", {"rooms": rooms})


def create(request):
    if request.method == "POST":
        room = Room()
        room.name = request.POST.get("name")
        room.number = request.POST.get("number")
        room.has_swimming = request.POST.get("has_swimming")
        room.has_heating = request.POST.get("has_heating")
        room.square = request.POST.get("square")
        room.save()
    return HttpResponseRedirect("/")


def edit(request, id):
    try:
        room = Room.objects.get(id=id)
        
        if request.method == "POST":
            room.name = request.POST.get("name")
            room.number = request.POST.get("number")
            room.has_swimming = request.POST.get("has_swimming")
            room.has_heating = request.POST.get("has_heating")
            room.square = request.POST.get("square")
            room.save()
        else:
            return render(request, "room/edit.html", {"room": room})
    except Room.DoesNotExist:
        return HttpResponseNotFound(room_not_found)
    

def delete(request, id):
    try:
        room = Room.objects.get(id=id)
        room.delete()
        return HttpResponseRedirect("/")
    except Room.DoesNotExist:
        return HttpResponseNotFound(room_not_found)