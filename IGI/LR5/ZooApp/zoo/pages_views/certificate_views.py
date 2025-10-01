from django.shortcuts import render

def certificate(request):
    return render(request, "certificate.html")