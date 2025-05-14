from django.shortcuts import redirect
from django.urls import reverse

class LoginRequiredMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.open_urls = [reverse('login'), reverse('register'),]

    def __call__(self, request):
        if not request.user.is_authenticated and request.path not in self.open_urls:
            return redirect('login')
        return self.get_response(request)