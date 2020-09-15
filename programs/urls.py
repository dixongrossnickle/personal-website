from django.urls import path
from . import views

urlpatterns = [
    path('', views.sim_index, name='sim_home'),
    path('run/', views.match_sim_json, name='run')
]
