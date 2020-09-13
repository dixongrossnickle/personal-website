from django.urls import path, include

urlpatterns = [
    path('', include('home.urls')),
    path('sim/', include('programs.urls'))
]
