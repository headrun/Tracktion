import views
from django.conf.urls import url

urlpatterns = [
    url(r'^clinicaltrail/', views.clinicaltrail),
    url(r'^get_wordcloud/', views.get_wordcloud),
    #url(r'^clinicaltrail/(?P<key>.+)/', views.filtersdata),
]
