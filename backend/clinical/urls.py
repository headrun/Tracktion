import views
from django.conf.urls import url

urlpatterns = [
    url(r'^clinicaltrail/', views.clinicaltrail),
    url(r'^clinicaltrail_summary/', views.clinicaltrail_summary),
    url(r'^get_wordcloud/', views.get_wordcloud),
    url(r'^get_social_media/', views.get_social_media),
    url(r'^get_articles/', views.get_articles),
    url(r'^search_scroll/', views.search_scroll),
    url(r'^wordcloud_dropdown/', views.wordcloud_dropdown),
    #url(r'^clinicaltrail/(?P<key>.+)/', views.filtersdata),
]
