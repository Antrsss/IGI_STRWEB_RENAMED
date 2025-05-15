from django.shortcuts import render, HttpResponseRedirect, HttpResponseNotFound
from django.contrib import messages
from ..pages_models import CompanyInfo

company_not_found = "<h2>Company info not found</h2>"

def index(request):
    """Просмотр информации о компании"""
    try:
        company = CompanyInfo.objects.first()
        if not company:
            return HttpResponseNotFound(company_not_found)
        return render(request, "company_info/index.html", {"company": company})
    except Exception as e:
        return HttpResponseNotFound(company_not_found)

def edit(request):
    """Редактирование информации о компании"""
    try:
        company = CompanyInfo.objects.first()
        if not company:
            company = CompanyInfo.objects.create(
                about_text="Default about text",
                history="Default history",
                requisites="Default requisites"
            )
        
        if request.method == "POST":
            company.about_text = request.POST.get("about_text", "").strip()
            company.history = request.POST.get("history", "").strip()
            company.requisites = request.POST.get("requisites", "").strip()
            
            if request.FILES.get("logo"):
                company.logo = request.FILES.get("logo")
            
            company.save()
            messages.success(request, "Company information updated successfully!")
            return HttpResponseRedirect("/company/edit/")
        
        return render(request, "company_info/edit.html", {"company": company})
    
    except Exception as e:
        messages.error(request, f"Error updating company info: {str(e)}")
        return HttpResponseRedirect("/company/")

def delete_logo(request):
    try:
        company = CompanyInfo.objects.first()
        if company and company.logo:
            company.logo.delete()
            company.save()
            messages.success(request, "Logo deleted successfully!")
        return HttpResponseRedirect("/company/edit/")
    except Exception as e:
        messages.error(request, f"Error deleting logo: {str(e)}")
        return HttpResponseRedirect("/company/edit/")