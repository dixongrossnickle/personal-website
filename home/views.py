from django.shortcuts import render

# Render main template
def index(request):
    response = render(request, 'index.html')
    response['Strict-Transport-Security'] = 'max-age=15768000; includeSubDomains'
    return response
