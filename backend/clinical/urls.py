import views
from django.conf.urls import url

urlpatterns = [
    url(r'^clinicaltrail/', views.clinicaltrail),
    #url(r'^clinicaltrail/(?P<key>.+)/', views.filtersdata),
]
