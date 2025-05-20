from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponseForbidden
from django.contrib.auth.decorators import login_required
from ..pages_models import FAQ
from ..forms import FAQAskForm, FAQAnswerForm

@login_required
def faq_index(request):
    faqs = FAQ.objects.all()
    return render(request, "pages/faq_list.html", {"faqs": faqs})


@login_required
def faq_ask(request):
    if not request.user.is_visitor:
        return HttpResponseForbidden("Only visitors can ask questions.")
    
    if request.method == "POST":
        form = FAQAskForm(request.POST)
        if form.is_valid():
            faq = form.save(commit=False)
            faq.asked_by = request.user
            faq.save()
            return redirect("faq_index")
    else:
        form = FAQAskForm()
    return render(request, "pages/faq_ask.html", {"form": form})


@login_required
def faq_answer(request, id):
    faq = get_object_or_404(FAQ, id=id)

    if not (request.user.is_employee or request.user.is_superuser):
        return HttpResponseForbidden("Only employees and admins can answer questions.")

    if request.method == "POST":
        form = FAQAnswerForm(request.POST, instance=faq)
        if form.is_valid():
            answer = form.save(commit=False)
            answer.answered_by = request.user
            answer.save()
            return redirect("faq_index")
    else:
        form = FAQAnswerForm(instance=faq)

    return render(request, "pages/faq_answer.html", {"form": form, "faq": faq})
