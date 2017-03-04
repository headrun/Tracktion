import views
from django.conf.urls import url

urlpatterns = [
    url(r'^enrollment/', views.enrollment),
    url(r'^enrollment_claim/', views.enrollment_claim),
    url(r'^claims/', views.claims),
    url(r'^claims_new/', views.claims_new),
    url(r'^claims_prov/', views.claims_prov),
    url(r'^inpatient/', views.inpatient_claim),
    url(r'^outpatient/', views.outpatient_claim),
    url(r'^financial_costanalysis/', views.financial_claimcostanalysis),
    url(r'^financial_onsite/', views.financial_onsite),
    url(r'^health_initiative/', views.health_initiative),
    url(r'^dental_vision/', views.dental_vision),
    url(r'^claims_cost_analysis/', views.claims_cost_analysis),
    url(r'^covidentifier/', views.covidentifier),
    url(r'^cov_filters/', views.cov_filters),
    url(r'^inpatient_claim/', views.inpatient_claim),
    url(r'^inpatient_filters/', views.inpatient_filters),
    url(r'^outpatient_filters/', views.outpatient_filters),
    url(r'^financial_filters/', views.financial_filters),
]
