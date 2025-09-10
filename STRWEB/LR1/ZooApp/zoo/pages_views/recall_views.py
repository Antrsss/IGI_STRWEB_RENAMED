from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseForbidden
from ..pages_models import Recall
from ..forms import RecallForm

def recall_index(request):
    recalls = Recall.objects.filter(is_published=True).order_by('-pub_date')
    form = RecallForm()

    if request.method == "POST":
        if request.user.is_authenticated:
            form = RecallForm(request.POST)
            if form.is_valid():
                recall = form.save(commit=False)
                recall.user = request.user
                recall.author_name = request.user.username
                recall.save()
                return redirect('recalls')
        else:
            return redirect('login')

    return render(request, "pages/recalls_list.html", {
        "recalls": recalls,
        "form": form,
        "user_authenticated": request.user.is_authenticated
    })

@login_required
def recall_create(request):
    if request.method == "POST":
        form = RecallForm(request.POST)
        if form.is_valid():
            recall = form.save(commit=False)
            recall.user = request.user
            recall.author_name = request.user.username
            recall.save()
            return redirect('recalls')
    else:
        form = RecallForm()
    
    return render(request, "recall/create.html", {"form": form})

@login_required
def recall_edit(request, id):
    recall = get_object_or_404(Recall, id=id)
    if recall.user != request.user and not request.user.is_staff:
        return HttpResponseForbidden("You don't have permission to edit this recall")

    if request.method == "POST":
        form = RecallForm(request.POST, instance=recall)
        if form.is_valid():
            form.save()
            return redirect('recalls')
    else:
        form = RecallForm(instance=recall)

    return render(request, "recall/edit.html", {"form": form, "recall": recall})

@login_required
def recall_delete(request, id):
    recall = get_object_or_404(Recall, id=id)
    if recall.user != request.user and not request.user.is_staff:
        return HttpResponseForbidden("You don't have permission to delete this recall")

    recall.delete()
    return redirect('recalls')
