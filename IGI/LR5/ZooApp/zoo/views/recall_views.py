from django.shortcuts import render, HttpResponseRedirect, HttpResponseNotFound
from ..models import Recall

recall_not_found = "<h2>Recall not found</h2>"

def recall_index(request):
    recalls = Recall.objects.filter(is_published=True)
    return render(request, "recall/index.html", {"recalls": recalls})

def recall_create(request):
    if request.method == "POST":
        recall = Recall()
        recall.author_name = request.POST.get("author_name")
        recall.rating = request.POST.get("rating")
        recall.text = request.POST.get("text")
        recall.is_published = 'is_published' in request.POST
        if request.user.is_authenticated:
            recall.user = request.user
        recall.save()
    return HttpResponseRedirect("/recalls/")

def recall_edit(request, id):
    try:
        recall = Recall.objects.get(id=id)
        if request.method == "POST":
            recall.author_name = request.POST.get("author_name")
            recall.rating = request.POST.get("rating")
            recall.text = request.POST.get("text")
            recall.is_published = 'is_published' in request.POST
            recall.save()
            return HttpResponseRedirect("/recalls/")
        return render(request, "recall/edit.html", {"recall": recall})
    except Recall.DoesNotExist:
        return HttpResponseNotFound(recall_not_found)

def recall_delete(request, id):
    try:
        recall = Recall.objects.get(id=id)
        recall.delete()
        return HttpResponseRedirect("/recalls/")
    except Recall.DoesNotExist:
        return HttpResponseNotFound(recall_not_found)