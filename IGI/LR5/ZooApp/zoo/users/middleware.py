from django.http import HttpResponseForbidden

class AccessControlMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        return response

    def process_view(self, request, view_func, view_args, view_kwargs):
        if request.path.startswith('/owner/') and not request.user.is_superuser:
            return HttpResponseForbidden()
        elif request.path.startswith('/employee/') and not request.user.is_employee:
            return HttpResponseForbidden()
        elif request.path.startswith('/visitor/') and not request.user.is_visitor:
            return HttpResponseForbidden()
        return None