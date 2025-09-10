from django.shortcuts import render
from ..pages_models import Article

def pages_index(request):
    latest_article = Article.objects.filter(is_published=True).order_by('-pub_date').first()
    return render(request, 'pages.html', {'latest_article': latest_article})