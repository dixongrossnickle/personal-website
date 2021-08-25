from django.shortcuts import render, redirect

# Render main template
def index(request):
    response = redirect('sim_home')
    
    return response


def error_404_view(request, exception=None):
    return render(request, '404.html', status=404)

def error_500_view(request, exception=None):
    return render(request, '500.html', status=500)