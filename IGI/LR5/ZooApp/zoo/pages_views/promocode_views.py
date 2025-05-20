from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponseNotFound
from django.utils import timezone
from ..pages_models import PromoCode

promocode_not_found = "<h2>Promocode not found</h2>"

def promocode_index(request):
    promocodes = PromoCode.objects.filter(is_active=True, expiry_date__gte=timezone.now())
    return render(request, "pages/promocode_list.html", {"promocodes": promocodes})

def promocode_create(request):
    if request.method == "POST":
        promocode = PromoCode()
        promocode.code = request.POST.get("code")
        promocode.description = request.POST.get("description")
        promocode.discount = request.POST.get("discount")
        promocode.expiry_date = request.POST.get("expiry_date")
        promocode.is_active = 'is_active' in request.POST
        promocode.save()
    return HttpResponseRedirect("/promocodes/")

def promocode_edit(request, id):
    try:
        promocode = PromoCode.objects.get(id=id)
        if request.method == "POST":
            promocode.code = request.POST.get("code")
            promocode.description = request.POST.get("description")
            promocode.discount = request.POST.get("discount")
            promocode.expiry_date = request.POST.get("expiry_date")
            promocode.is_active = 'is_active' in request.POST
            promocode.save()
            return HttpResponseRedirect("/promocodes/")
        return render(request, "promocode/edit.html", {"promocode": promocode})
    except PromoCode.DoesNotExist:
        return HttpResponseNotFound(promocode_not_found)

def promocode_delete(request, id):
    try:
        promocode = PromoCode.objects.get(id=id)
        promocode.delete()
        return HttpResponseRedirect("/promocodes/")
    except PromoCode.DoesNotExist:
        return HttpResponseNotFound(promocode_not_found)