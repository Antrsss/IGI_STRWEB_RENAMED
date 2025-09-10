from django.shortcuts import render, redirect
from django.http import HttpResponseNotFound
from django.contrib import messages
from .models import Room

room_not_found = "<h2>Room not found</h2>"

def index(request):
    rooms = Room.objects.all().order_by('number')
    return render(request, "room/index.html", {"rooms": rooms})

def create(request):
    if request.method == "POST":
        try:
            room = Room(
                name=request.POST.get("name", "").strip(),
                number=int(request.POST.get("number", 0)),
                has_swimming=bool(request.POST.get("has_swimming", False)),
                has_heating=bool(request.POST.get("has_heating", False)),
                square=float(request.POST.get("square", 0.0))
            )
            room.full_clean()
            room.save()
            messages.success(request, "Room created successfully!")
            return redirect("rooms:index")
            
        except ValueError as e:
            messages.error(request, f"Invalid input: {str(e)}")
        except Exception as e:
            messages.error(request, f"Error creating room: {str(e)}")
    
    return redirect("rooms:index")

def delete(request, id):
    try:
        room = Room.objects.get(id=id)
        room.delete()
        messages.success(request, "Room deleted successfully!")
    except Room.DoesNotExist:
        messages.error(request, "Room not found")
    return redirect("rooms:index")