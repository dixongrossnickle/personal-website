from django.shortcuts import render

# Render main template
def index(request):
    response = render(request, 'index.html')
    response['Strict-Transport-Security'] = 'max-age=15768000; includeSubDomains'
    return response

def error_404_view(request, exception=None):
    return render(request, '404.html', status=404)

def error_500_view(request, exception=None):
    return render(request, '500.html', status=500)