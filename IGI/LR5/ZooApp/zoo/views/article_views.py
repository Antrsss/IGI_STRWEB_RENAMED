from django.shortcuts import render, HttpResponseRedirect, HttpResponseNotFound
from ..models import Article

article_not_found = "<h2>Article not found</h2>"

def article_index(request):
    articles = Article.objects.all()
    return render(request, "article/index.html", {"articles": articles})

def article_create(request):
    if request.method == "POST":
        article = Article()
        article.title = request.POST.get("title")
        article.short_description = request.POST.get("short_description")
        article.full_text = request.POST.get("full_text")
        article.image = request.FILES.get("image")
        article.is_published = 'is_published' in request.POST
        article.save()
    return HttpResponseRedirect("/articles/")

def article_edit(request, id):
    try:
        article = Article.objects.get(id=id)
        if request.method == "POST":
            article.title = request.POST.get("title")
            article.short_description = request.POST.get("short_description")
            article.full_text = request.POST.get("full_text")
            if request.FILES.get("image"):
                article.image = request.FILES.get("image")
            article.is_published = 'is_published' in request.POST
            article.save()
            return HttpResponseRedirect("/articles/")
        return render(request, "article/edit.html", {"article": article})
    except Article.DoesNotExist:
        return HttpResponseNotFound(article_not_found)

def article_delete(request, id):
    try:
        article = Article.objects.get(id=id)
        article.delete()
        return HttpResponseRedirect("/articles/")
    except Article.DoesNotExist:
        return HttpResponseNotFound(article_not_found)