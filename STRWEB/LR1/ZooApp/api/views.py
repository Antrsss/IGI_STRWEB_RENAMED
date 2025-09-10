from django.shortcuts import render
import requests


def cats_index(request):
    url = 'https://catfact.ninja/fact'
    
    res = requests.get(url).json()
    
    cat_info = {
        'fact': res["fact"]
    }
    
    context = {'info': cat_info}
    return render(request, 'cats/index.html', context)
    
def dogs_index(request):
    url = 'https://dog.ceo/api/breeds/image/random'
    
    res = requests.get(url).json()
    
    dog_info = {
        'message': res["message"],
        'status': res["status"]
    }
    
    context = {'info': dog_info}
    return render(request, 'dogs/index.html', context)