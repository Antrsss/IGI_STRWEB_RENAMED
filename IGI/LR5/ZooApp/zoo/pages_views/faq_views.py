from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponseNotFound
from ..pages_models import FAQ

faq_not_found = "<h2>FAQ not found</h2>"

def faq_index(request):
    faqs = FAQ.objects.all()
    return render(request, "pages/faq_list.html", {"faqs": faqs})

def faq_create(request):
    if request.method == "POST":
        faq = FAQ()
        faq.question = request.POST.get("question")
        faq.answer = request.POST.get("answer")
        faq.save()
    return HttpResponseRedirect("/faqs/")

def faq_edit(request, id):
    try:
        faq = FAQ.objects.get(id=id)
        if request.method == "POST":
            faq.question = request.POST.get("question")
            faq.answer = request.POST.get("answer")
            faq.save()
            return HttpResponseRedirect("/faqs/")
        return render(request, "faq/edit.html", {"faq": faq})
    except FAQ.DoesNotExist:
        return HttpResponseNotFound(faq_not_found)

def faq_delete(request, id):
    try:
        faq = FAQ.objects.get(id=id)
        faq.delete()
        return HttpResponseRedirect("/faqs/")
    except FAQ.DoesNotExist:
        return HttpResponseNotFound(faq_not_found)