from django.urls import path, include

urlpatterns = [
    path('', include('home.urls')),
    path('sim/', include('programs.urls'))
]

handler404 = 'home.views.error_404_view'
handler500 = 'home.views.error_500_view'
