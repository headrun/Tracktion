import json

from django.shortcuts import render
from django.db.models import Sum

from models import *
from auth.decorators import loginRequired
from common.utils import getHttpResponse as HttpResponse
from common.decorators import allowedMethods

@allowedMethods(["GET"])
@loginRequired
def enrollment(request):
    plan = request.GET.get('plan', '')
    gender = request.GET.get('gender', '')
    location = request.GET.get('location', '')
    age_group = request.GET.get('age_group', '')
    income_group = request.GET.get('income_group', '')
    startYear = request.GET.get('startYear', '2016')
    endYear = request.GET.get('endYear', '2016')

    locations, age_groups, income_groups, top_plans = {}, {}, {}, {}

    objs = EnrollmentSummary.objects.filter(year__gte=startYear, year__lte=endYear)

    if plan:
        objs = objs.filter(plan=plan)
    if location:
        objs = objs.filter(location=location)
    if age_group:
        objs = objs.filter(age_group=age_group)
    if income_group:
        objs = objs.filter(income_group=income_group)
    if gender:
        objs = objs.filter(gender=gender)

    for obj in objs:
        loc_data = locations.get(obj.location, {})
        loc_data[obj.gender] = loc_data.get(obj.gender, 0) + obj.total
        loc_data['total'] = loc_data.get('total', 0) + obj.total
        loc_data['emp_total'] = loc_data.get('emp_total', 0) + obj.emp_total
        locations[obj.location] = loc_data

        age_groups[obj.age_group] = age_groups.get(obj.age_group, 0) + obj.total

        income_data = income_groups.get(obj.income_group, {})
        income_data['total'] = income_data.get('total', 0) + obj.total
        income_data['emp_total'] = income_data.get('emp_total', 0) + obj.emp_total
        income_groups[obj.income_group] = income_data

        top_plans[obj.plan] = top_plans.get(obj.plan, 0) + obj.total

    for loc, data in locations.iteritems():
        locations[loc]['ratio'] = round(float(data['total'])/data['emp_total'], 1)

    final_data = {}
    final_data['locations'] = locations
    final_data['age_groups'] = age_groups
    final_data['income_groups'] = income_groups
    final_data['top_plans'] = top_plans

    for key, value in income_groups.iteritems():
        income_groups[key]['avg_emp'] = round(float(value['total'])/float(value['emp_total']), 2)

    return HttpResponse(final_data)

def enrollment_claim(request):
    plan = request.GET.get('plan', '')
    gender = request.GET.get('gender', '')
    location = request.GET.get('location', '')
    age_group = request.GET.get('age_group', '')

    locations, age_groups, plans = {}, {}, {}

    objs = EnrollClaimSummary.objects.all()

    if plan:
        objs = objs.filter(plan=plan)
    if location:
        objs = objs.filter(location=location)
    if age_group:
        objs = objs.filter(age_group=age_group)

    for obj in objs:
        age_groups[obj.age_group] = age_groups.get(obj.age_group, 0) + obj.total
        plans[obj.plan] = plans.get(obj.plan, 0) + obj.total
        loc = locations.get(obj.location, {'total':0, 'emp_total':0})
        loc['total'] += obj.total
        loc['emp_total'] += obj.emp_total
        locations[obj.location] = loc

    for loc, data in locations.iteritems():
        locations[loc]['ratio'] = round(float(data['total'])/data['emp_total'], 1)

    final_data = {}
    final_data['age_groups'] = age_groups
    final_data['plans'] = plans
    final_data['locations'] = locations

    return HttpResponse(final_data)

def compute_average(data):
    for k,v in data.iteritems():
        data[k]['avg'] = round(float(v['total_amount'])/v['total'], 2)

    return data

def get_top_data(all_data, key):
    _all_data = []
    for _key, data in all_data.iteritems():
        if key == 'value':
            value = data
        else:
            value = data[key]
        _all_data.append((_key, value))
    
    _all_data = sorted(_all_data, key=lambda x: x[1], reverse=True)
    _all_data = _all_data[:10]

    all_data_ = {}
    for _key, total in _all_data:
        all_data_[_key] = all_data[_key]

    return all_data_

@allowedMethods(["GET"])
@loginRequired
def claims_prov(request):

    start_month = request.GET.get('startMonth', '')
    end_month = request.GET.get('endMonth', '')
    plan = request.GET.get('plan', '')
    sub_category = request.GET.get('sub_category', '')
    location = request.GET.get('location', '')
    disease = request.GET.get('disease', '')
    procedure = request.GET.get('procedure', '')
    final_data = {}

    if start_month and not end_month:
        end_month = start_month
    if end_month and not start_month:
        start_month = '1'

    objs = ClaimsProvidersSummary.objects.all()
    
    if start_month:
        objs = objs.filter(month__gte=start_month)
    if end_month:
        objs = objs.filter(month__lte=end_month)
    if plan:
        objs = objs.filter(plan=plan)
    if location:
        objs = objs.filter(location=location)
    if disease:
        objs = objs.filter(disease=disease)
    if procedure:
        objs = objs.filter(procedure=procedure)

    company_total = Claim.objects.filter(cpt4=procedure).aggregate(Sum('amt_charge'))['amt_charge__sum']
    company_avg = round(float(company_total)/Claim.objects.filter(cpt4=procedure).count(), 2)
    industry_bench_mark = compute_benchmark(company_avg, 2)
    final_data = {}
    for obj in objs:
        data = json.loads(obj.data)
        for k, v in data.iteritems():
            prov = final_data.get(k, {'total':0, 'total_amount':0})
            prov['total'] += v['total']
            prov['total_amount'] += v['total_amount']
            final_data[k] = prov

    final_data = compute_average(final_data)
    all_data = []
    for prov, stats in final_data.iteritems():
        all_data.append([prov, round(stats['total_amount'], 2), company_avg, industry_bench_mark, stats['total']])

    
    all_data = sorted(all_data, key=lambda x: x[2], reverse=True)
    final_data = []
    if len(all_data)>10:
        final_data.extend(all_data[:5])
        final_data.extend(all_data[-5:])
    else:
        final_data = all_data


    return HttpResponse(final_data)

@allowedMethods(["GET"])
@loginRequired
def claims(request):

    start_month = request.GET.get('startMonth', '')
    end_month = request.GET.get('endMonth', '')
    plan = request.GET.get('plan', '')
    sub_category = request.GET.get('sub_category', '')
    location = request.GET.get('location', '')

    if start_month and not end_month:
        end_month = 12
    if end_month and not start_month:
        start_month = 1

    objs = ClaimsAll.objects.all()
    if start_month:
        objs = objs.filter(month__gte=start_month)
    if end_month:
        objs = objs.filter(month__lte=end_month)
    if plan:
        objs = objs.filter(plan=plan)
    if location:
        objs = objs.filter(location=location)
    claims_trends, avg_claims, top_diseases, claims_proc, claims_healthy = {}, {}, {}, {}, {}
    claims_smoking, claims_bmi, claims_loc, claims_age, claims_cutoff = {}, {}, {}, {}, {}

    for obj in objs:
        raw_data = json.loads(obj.data)
        claim_trend = claims_trends.get(obj.month, {'total':0, 'total_amount':0})
        claim_trend['total'] += float(raw_data['claims_trends']['total'])
        claim_trend['total_amount'] += float(raw_data['claims_trends']['total_amount'])
        claims_trends[obj.month] = claim_trend
        #claims_trends['total'] = claims_trends.get('total', 0) + obj.total
        #claims_trends['total_amount'] = claims_trends.get('total_amount', 0) + obj.total_amount

        avg = avg_claims.get(obj.month, {'insurer':0, 'pocket':0})
        avg['insurer'] += float(raw_data['avg_claims']['insurer'])
        avg['pocket'] += float(raw_data['avg_claims']['pocket'])
        avg_claims[obj.month] = avg

        for _disease, _data in raw_data['top_diseases'].iteritems():
            disease = top_diseases.get(_disease, {'total':0, 'patients':0, 'total_amount':0, 'proc':{}})
            disease['total'] += _data['total']
            disease['patients'] += _data['patients']
            disease['total_amount'] += float(_data['total_amount'])
            for _proc, proc_data in _data['proc'].iteritems():
                proc = disease['proc'].get(_proc, {'total':0, 'total_amount':0})
                proc['total'] += float(proc_data['total'])
                proc['total_amount'] += float(proc_data['total_amount'])
                disease['proc'][_proc] = proc

            top_diseases[_disease] = disease

        for _proc, _data in raw_data['claims_proc'].iteritems():
            proc = claims_proc.get(_proc, {'total':0, 'patients':0, 'total_amount':0})
            proc['total'] += _data['total']
            proc['patients'] += _data['patients']
            proc['total_amount'] += float(_data['total_amount'])
            claims_proc[_proc] = proc
        
        for _disease, _data in raw_data['claims_healthy'].iteritems():
            health = claims_healthy.get(_disease, {'healthy':0, 'unhealthy':0})
            health['healthy'] += _data['healthy']
            health['unhealthy'] += _data['unhealthy']
            claims_healthy[_disease] = health

        for _disease, _data in raw_data['claims_smoking'].iteritems():
            smoking = claims_smoking.get(_disease, {'smoker':0, 'non_smoker':0})
            smoking['smoker'] += _data['smoker']
            smoking['non_smoker'] += _data['non_smoker']
            claims_smoking[_disease] = smoking

        for _disease, _data in raw_data['claims_bmi'].iteritems():
            bmi = claims_bmi.get(_disease, {'obese':0, 'fit':0})
            bmi['obese'] += _data['obese']
            bmi['fit'] += _data['fit']
            claims_bmi[_disease] = bmi

        for _loc, _data in raw_data['claims_loc'].iteritems():
            loc = claims_loc.get(_loc, {'total':0, 'total_amount':0})
            loc['total'] += float(_data['total'])
            loc['total_amount'] += float(_data['total_amount'])
            claims_loc[_loc] = loc
        
        for _age_group, _data in raw_data['claims_age'].iteritems():
            age_group = claims_age.get(_age_group, {'total':0, 'total_amount':0})
            age_group['total'] += float(_data['total'])
            age_group['total_amount'] += float(_data['total_amount'])
            claims_age[_age_group] = age_group

        for _disease, _data in raw_data['claims_cutoff'].iteritems():
            cutoff = claims_cutoff.get(_disease, {'total':0, 'total_amount':0})
            cutoff['total'] += float(_data['total'])
            cutoff['total_amount'] += float(_data['total_amount'])
            claims_cutoff[_disease] = cutoff

    top_diseases = get_top_data(top_diseases, 'total')
    claims_proc = get_top_data(claims_proc, 'total') 
    claims_smoking = get_top_data(claims_smoking, 'non_smoker')
    claims_bmi = get_top_data(claims_bmi, 'fit')
    claims_healthy = get_top_data(claims_healthy, 'healthy')

    for disease, data in top_diseases.iteritems():
        data['proc'] = get_top_data(data['proc'], 'value')
        data['proc'] = compute_average(data['proc'])

    claims_trends = compute_average(claims_trends)
    claims_age = compute_average(claims_age)
    claims_loc = compute_average(claims_loc)
    claims_cutoff = compute_average(claims_cutoff)
    top_diseases = compute_average(top_diseases)
    for k,v in avg_claims.iteritems():
        avg_claims[k]['insurer'] = round(avg_claims[k]['insurer'], 2)
        avg_claims[k]['pocket'] = round(avg_claims[k]['pocket'], 2)

    final_data = {}
    final_data['claims_trends'] = claims_trends
    final_data['avg_claims'] =avg_claims
    final_data['top_diseases'] = top_diseases
    final_data['claims_proc'] = claims_proc
    final_data['claims_healthy'] = claims_healthy
    final_data['claims_smoking'] = claims_smoking
    final_data['claims_bmi'] = claims_bmi
    final_data['claims_loc'] = claims_loc
    final_data['claims_age'] = claims_age
    final_data['claims_cutoff'] = claims_cutoff

    return HttpResponse(final_data)

@allowedMethods(["GET"])
@loginRequired
def claims_new(request):

    month = request.GET.get('month', '1')
    plan = request.GET.get('plan', '')
    sub_category = request.GET.get('sub_category', '')
    location = request.GET.get('location', '')


    objs = ClaimsSummary.objects.all()

    if month:
        objs = objs.filter(month=month)
    if plan:
        objs = objs.filter(plan=plan)
    if location:
        objs = objs.filter(location=location)

    claims_trends, avg_claims, top_diseases, claims_proc, claims_healthy = {}, {}, {}, {}, {}
    claims_smoking, claims_bmi, claims_loc, claims_age, claims_cutoff = {}, {}, {}, {}, {}

    for obj in objs:
        claim_trend = claims_trends.get(obj.month, {'total':0, 'total_amount':0})
        claim_trend['total'] += float(obj.total)
        claim_trend['total_amount'] += float(obj.total_amount)
        claims_trends[obj.month] = claim_trend
        #claims_trends['total'] = claims_trends.get('total', 0) + obj.total
        #claims_trends['total_amount'] = claims_trends.get('total_amount', 0) + obj.total_amount

        avg = avg_claims.get(obj.month, {'insurer':0, 'pocket':0})
        avg['insurer'] += float(obj.insuer)
        avg['pocket'] += float(obj.pocket)
        avg_claims[obj.month] = avg

        disease = top_diseases.get(obj.disease, {'total':0, 'patients':0, 'total_amount':0, 'proc':{}})
        disease['total'] += obj.total
        disease['patients'] += obj.patients
        disease['total_amount'] += float(obj.total_amount)
        proc = disease['proc'].get(obj.procedure, {'total':0, 'total_amount':0})
        proc['total'] += float(obj.total)
        proc['total_amount'] += float(obj.total_amount)
        disease['proc'][obj.procedure] = proc
        top_diseases[obj.disease] = disease
        #top_diseases[obj.disease] = top_diseases.get(obj.disease, 0) + obj.total

        proc = claims_proc.get(obj.procedure, {'total':0, 'patients':0, 'total_amount':0})
        proc['total'] += obj.total
        proc['patients'] += obj.patients
        proc['total_amount'] += float(obj.total_amount)
        claims_proc[obj.procedure] = proc
        #claims_proc['total'] = claims_proc.get('total', 0) + obj.total
        #claims_proc['patients'] = claims_proc.get('patients', 0) + obj.patients
        #claims_proc['total_amount'] = claims_proc.get('total_amount', 0) + float(obj.total_amount)

        health = claims_healthy.get(obj.disease, {'healthy':0, 'unhealthy':0})
        health['healthy'] += obj.healthy
        health['unhealthy'] += obj.unhealthy
        claims_healthy[obj.disease] = health

        smoking = claims_smoking.get(obj.disease, {'smoker':0, 'non_smoker':0})
        smoking['smoker'] += obj.smoker
        smoking['non_smoker'] += obj.non_smoker
        claims_smoking[obj.disease] = smoking

        bmi = claims_bmi.get(obj.disease, {'obese':0, 'fit':0})
        bmi['obese'] += obj.obese
        bmi['fit'] += obj.fit
        claims_bmi[obj.disease] = bmi

        loc = claims_loc.get(obj.location, {'total':0, 'total_amount':0})
        loc['total'] += float(obj.total)
        loc['total_amount'] += float(obj.total_amount)
        claims_loc[obj.location] = loc
        
        age_group = claims_age.get(obj.age_group, {'total':0, 'total_amount':0})
        age_group['total'] += float(obj.total)
        age_group['total_amount'] += float(obj.total_amount)
        claims_age[obj.age_group] = age_group

        if  obj.total_amount > 125000:
            cutoff = claims_cutoff.get(obj.disease, {'total':0, 'total_amount':0})
            cutoff['total'] += float(obj.total)
            cutoff['total_amount'] += float(obj.total_amount)
            claims_cutoff[obj.disease] = cutoff

    top_diseases = get_top_data(top_diseases, 'total')
    claims_proc = get_top_data(claims_proc, 'total') 
    claims_smoking = get_top_data(claims_smoking, 'non_smoker')
    claims_bmi = get_top_data(claims_bmi, 'fit')
    claims_healthy = get_top_data(claims_healthy, 'healthy')

    for disease, data in top_diseases.iteritems():
        data['proc'] = get_top_data(data['proc'], 'value')
        data['proc'] = compute_average(data['proc'])

    claims_trends = compute_average(claims_trends)
    claims_age = compute_average(claims_age)
    claims_loc = compute_average(claims_loc)
    claims_cutoff = compute_average(claims_cutoff)
    top_diseases = compute_average(top_diseases)
    for k,v in avg_claims.iteritems():
        avg_claims[k]['insurer'] = round(avg_claims[k]['insurer'], 2)
        avg_claims[k]['pocket'] = round(avg_claims[k]['pocket'], 2)

    final_data = {}
    final_data['claims_trends'] = claims_trends
    final_data['avg_claims'] =avg_claims
    final_data['top_diseases'] = top_diseases
    final_data['claims_proc'] = claims_proc
    final_data['claims_healthy'] = claims_healthy
    final_data['claims_smoking'] = claims_smoking
    final_data['claims_bmi'] = claims_bmi
    final_data['claims_loc'] = claims_loc
    final_data['claims_age'] = claims_age
    final_data['claims_cutoff'] = claims_cutoff
    return HttpResponse(final_data)

def inpatient(request):
    population = request.GET.get('population', 'All')
    geography = request.GET.get('geography', 'All')
    plan = request.GET.get('plan', 'All')
    claimsdriver = request.GET.get('claimsdriver', 'All')
    
    final_data = {}
    data = {}
    objs = InpatientCostDriver.objects.filter(population=population, geography=geography, plan=plan, claimsdriver=claimsdriver)

    obj = objs[0]
    data['claims'] = json.loads(obj.claims)
    data['facilities'] = json.loads(obj.facilities)
    data['claims_service'] = json.loads(obj.claims_service)
    data['claims_cost_service'] = json.loads(obj.claims_cost_service)

    final_data['costdriver'] = data

    data = {}
    objs = InpatientVisitTrend.objects.filter(population=population, geography=geography, plan=plan, claimsdriver=claimsdriver)

    obj = objs[0]
    data['trends'] = json.loads(obj.trends)
    data['trends_type'] = json.loads(obj.trends_type)
    data['cost'] = json.loads(obj.cost)
    final_data['visittrend'] = data
    
    data = {}
    objs = InpatientStayAnalysis.objects.filter(population=population, geography=geography, plan=plan, claimsdriver=claimsdriver)

    obj = objs[0]
    data['total'] = json.loads(obj.total)
    data['avg'] = json.loads(obj.avg)
    final_data['stayanalysis'] = data

    data = {}
    objs = InpatientReadmissions.objects.filter(population=population, geography=geography, plan=plan, claimsdriver=claimsdriver)

    obj = objs[0]
    data['analysis'] = json.loads(obj.analysis)
    final_data['readmissions'] = data

    return HttpResponse(final_data)

def outpatient(request):
    population = request.GET.get('population', 'All')
    geography = request.GET.get('geography', 'All')
    plan = request.GET.get('plan', 'All')
    claimsdriver = request.GET.get('claimsdriver', 'All')
    
    final_data = {}
    data = {}
    objs = OutpatientCostDriver.objects.filter(population=population, geography=geography, plan=plan, claimsdriver=claimsdriver)

    obj = objs[0]
    data['claims'] = json.loads(obj.claims)
    data['facilities'] = json.loads(obj.facilities)
    data['claims_service'] = json.loads(obj.claims_service)
    data['claims_cost_service'] = json.loads(obj.claims_cost_service)

    final_data['costdriver'] = data

    data = {}
    objs = OutpatientVisitTrend.objects.filter(population=population, geography=geography, plan=plan, claimsdriver=claimsdriver)

    obj = objs[0]
    data['trends'] = json.loads(obj.trends)
    data['trends_type'] = json.loads(obj.trends_type)
    data['cost'] = json.loads(obj.cost)
    final_data['visittrend'] = data

    return HttpResponse(final_data)

def financial_costanalysis(request):
    plan = request.GET.get('plan', 'All')
    location = request.GET.get('location', 'All')
    customer_segment = request.GET.get('customer_segment', 'All')
    year = request.GET.get('year', 'All')
    
    final_data = {}
    objs = FinancialCostAnalysis.objects.filter(plan=plan, location=location, customer_segment=customer_segment, year=year)

    if objs:
        obj = objs[0]
        final_data['avg_cost'] = json.loads(obj.avg_cost)
        final_data['tot_cost'] = json.loads(obj.tot_cost)
        final_data['sub_category'] = json.loads(obj.sub_category)
        final_data['plan_cost'] = json.loads(obj.plan_cost)

    return HttpResponse(final_data)

def financial_onsite(request):
    customer_segment = request.GET.get('customer_segment', 'All')
    
    final_data = {}
    objs = FinancialOnsiteClinicImpact.objects.filter(customer_segment=customer_segment)

    if objs:
        obj = objs[0]
        final_data['onsite_clinic'] = json.loads(obj.onsite_clinic)
        final_data['impact_on_health'] = json.loads(obj.impact_on_health)
        final_data['onsite_clinic_attendees'] = json.loads(obj.onsite_clinic_attendees)
        final_data['visiting_specialities'] = json.loads(obj.visiting_specialities)

    return HttpResponse(final_data)

def health_initiative(request):
    location = request.GET.get('location', 'All')
    year = request.GET.get('year', 'All')
    
    final_data = {}
    objs = HealthInitiative.objects.filter(location=location, year=year)

    if objs:
        obj = objs[0]
        final_data['programs'] = json.loads(obj.programs)
        final_data['attendees'] = json.loads(obj.attendees)
        final_data['completion_rate'] = json.loads(obj.completion_rate)

    return HttpResponse(final_data)

def dental_vision(request):
    population = request.GET.get('population', 'All')
    geography = request.GET.get('geography', 'All')
    plan = request.GET.get('plan', 'All')
    
    final_data = {}
    data = {}
    objs = Dental.objects.filter(population=population, geography=geography, plan=plan)

    obj = objs[0]
    data['claims'] = json.loads(obj.claims)
    data['claims_member'] = json.loads(obj.claims_member)

    final_data['dental'] = data

    data = {}
    objs = Vision.objects.filter(population=population, geography=geography, plan=plan)

    obj = objs[0]
    data['claims'] = json.loads(obj.claims)
    data['claims_member'] = json.loads(obj.claims_member)
    final_data['vision'] = data

    return HttpResponse(final_data)

def claims_cost_analysis(request):
    location = request.GET.get('location', 'All')
    year = request.GET.get('year', 'All')
    
    final_data = {}
    data = {}
    objs = ClaimsCostAnalysis.objects.filter(location=location, year=year)

    obj = objs[0]
    data['claims'] = json.loads(obj.claims)
    data['cost'] = json.loads(obj.cost)
    data['cov_othercost'] = json.loads(obj.cov_othercost)

    final_data['claims_cost'] = data

    return HttpResponse(final_data)

def covidentifier(request):
    location = request.GET.get('location', 'Loc1')
    disease = request.GET.get('disease', 'TA1')
    procedure = request.GET.get('procedure', 'Proc1')
    
    final_data = {}
    data = {}
    objs = CovIdentifier.objects.filter(location=location, disease=disease, procedure=procedure)

    obj = objs[0]
    data['providers'] = json.loads(obj.providers)

    final_data['providers'] = data

    return HttpResponse(final_data)

def inpatient_filters(request):
    objs = InpatientCostDriver.objects.all()
   
    final_data = {} 
    final_data['geography'] = [str(loc) for loc in objs.values_list('geography', flat=True).distinct()]
    final_data['plan'] = [str(plan) for plan in objs.values_list('plan', flat=True).distinct()]
    return HttpResponse(final_data)


def outpatient_filters(request):
    objs = OutpatientCostDriver.objects.all()
   
    final_data = {} 
    final_data['geography'] = [str(loc) for loc in objs.values_list('geography', flat=True).distinct()]
    final_data['plan'] = [str(plan) for plan in objs.values_list('plan', flat=True).distinct()]
    return HttpResponse(final_data)


def financial_filters(request):
    objs = FinancialClaimCostAnalysis.objects.all()
   
    final_data = {} 
    final_data['location'] = [str(loc) for loc in objs.values_list('location', flat=True).distinct()]
    final_data['plan'] = [str(plan) for plan in objs.values_list('plan', flat=True).distinct()]
    return HttpResponse(final_data)

def cov_filters(request):

    disease = request.GET.get('disease', '')
    location = request.GET.get('location', '')
    procedure = request.GET.get('procedure', '')
    final_data = {}


    objs = ClaimsProvidersSummary.objects.filter(total__gte=4)
    
    if disease:
        objs = objs.filter(disease=disease)
    if location:
        objs = objs.filter(location=location)
    if procedure:
        objs = objs.filter(procedure=procedure)

    procs = []
    final_data['locations'] = [str(loc) for loc in objs.values_list('location', flat=True).distinct()]
    final_data['diseases'] = [str(_disease) for _disease in objs.values_list('disease', flat=True).distinct()]
    if disease:
        for proc in objs.values_list('procedure', flat=True).distinct()[:100]:
            if proc: procs.append(str(proc))
        final_data['procedures'] = procs

    return HttpResponse(final_data)

def financial_claimcostanalysis(request):
    plan = request.GET.get('plan', '')
    location = request.GET.get('location', '')
    quarter = request.GET.get('quarter', '')

    final_data = {}
    objs = FinancialClaimCostAnalysis.objects.all()
    if plan:
        objs = objs.filter(plan=plan)
    if location:
        objs = objs.filter(location=location)
    if quarter:
        objs = objs.filter(quarter, quarter)

    avg_cost = {}
    tot_cost = {}
    for obj in objs:

        avg = avg_cost.get(obj.quarter, {'total':0, 'emp':0, 'mem':0})
        avg['total'] += round(float(obj.total_amount), 2)
        avg['emp'] += obj.emp_total
        avg['mem'] += obj.mem_total
        avg_cost[obj.quarter] = avg

        tot_cost[obj.quarter] = tot_cost.get(obj.quarter, 0) + round(float(obj.total_amount), 2)
        
    
    avg_cost = [[k, round(v['total']/v['emp'], 2), round(v['total']/v['mem'],2 )] for k, v in avg_cost.iteritems()]
    tot_cost = [[k,round(v,2)] for k,v in tot_cost.iteritems()]
    tot_cost = sorted(tot_cost, key=lambda x: x[0])
    costs = [_cost[1] for _cost in tot_cost]
    growths = []
    for index, value in enumerate(costs):
        if index==0:
            tot_cost[index].append(1)
            continue
        growth = round(((value - costs[index-1])/value)*100, 2)
        tot_cost[index].append(growth)
        growths.append(growth)

    final_data['avg_cost'] = sorted(avg_cost, key=lambda x: x[0])
    final_data['tot_cost'] = tot_cost
    final_data['sub_category'] = json.loads(obj.sub_category)
    final_data['plan_cost'] = json.loads(obj.plan_cost)

    return HttpResponse(final_data)

def compute_benchmark(value, index):
    ratios = [5, 3, 2, 6, 8, 6, 9, 12, 15, 11, 18, 17, 16]
    return round(value - ((float(value)/100)*ratios[index]), 2)

def map_month(month):
    mapping = {1: 'Jan-15', 2:'Feb-15', 3:'Mar-15', 4:'Apr-15', 5:'May-15',\
               6:'Jun-15', 7:'Jul-15', 8:'Aug-15', 9:'Sep-15', 10:'Oct-15',\
               11:'Nov-15', 12:'Dec-15'}

    return mapping[month]

def compute_trends(count, month):
    t1 = round((float(count)/100)*10, 1)
    t2 = round((float(count)/100)*25, 1)
    t3 = round((float(count)/100)*15, 1)
    t4 = round((float(count)/100)*20, 1)
    t5 = round(count -t1-t2-t3-t4, 1)

    return [month, t1, t2,t3, t4, t5]

def compute_costdrivers(geography, plan, claimsdriver, table):

    data = {}
    objs = table.objects.filter(population='alli').exclude(claimsdriver='other')
    if geography:
        objs = objs.filter(geography=geography)
    if plan:
        objs = objs.filter(plan=plan)
    if claimsdriver:
        objs = objs.filter(claimsdriver=claimsdriver)

    claims, facilities = {}, {}
    for obj in objs:
        claims[obj.claimsdriver] = claims.get(obj.claimsdriver, 0) + float(obj.claims)
        Decimal = float
        for _facility, _data in eval(obj.facilities).iteritems():
            facility = facilities.get(_facility, {'total':0, 'total_amount':0})
            facility['total'] += _data['total']
            facility['total_amount'] += _data['total_amount']
            facilities[_facility] = facility

    claims = [[k,round(v, 2)] for k,v in claims.iteritems()]
    claims = sorted(claims, key=lambda x: x[1], reverse=True)[:5]
    facilities = [[k, round(v['total_amount']/v['total'],2), v['total']] for k, v in facilities.iteritems()]
    facilities = sorted(facilities, key=lambda x: x[1], reverse=True)[:5]
    _claims, _facilities = [], []
    for index, value in enumerate(claims):
        _claims.append([value[0], value[1], compute_benchmark(value[1], index)])

    for index, value in enumerate(facilities):
        _facilities.append([value[0], value[2], value[1], compute_benchmark(value[1], index)])
            
    data['claims'] = _claims
    data['facilities'] = _facilities
    data['claims_service'] = json.loads(obj.claims_service)
    data['claims_cost_service'] = json.loads(obj.claims_cost_service)
    return data

def compute_visittrends(geography, plan, claimsdriver, table):

    data = {}
    objs = table.objects.filter(population='alli')
    if geography:
        objs = objs.filter(geography=geography)
    if plan:
        objs = objs.filter(plan=plan)
    if claimsdriver:
        objs = objs.filter(claimsdriver=claimsdriver)
    visits, costs = {}, {}

    for obj in objs:
        for month, count in eval(obj.trends).iteritems():
            visits[month] = visits.get(month, 0) + count
        Decimal = float
        for month, counts in eval(obj.cost).iteritems():
            cost = costs.get(month, {'total':0, 'total_amount':0, 'paid':0})
            cost['total'] += counts['total']
            cost['total_amount'] += counts['total_amount']
            cost['paid'] += counts['paid']
            costs[month] = cost

    costs = [[k, round(v['total_amount']/v['total'], 2), round(v['paid']/v['total'], 2)] for k, v in costs.iteritems()]
    _costs = []
    for index, values in enumerate(costs):
        _costs.append([map_month(values[0]), values[1], values[2], compute_benchmark(values[1], index)])
   
    trends_type, _visits = [], []
    for month, count in visits.iteritems():
        _visits.append([map_month(month), count])
        trends_type.append(compute_trends(count, map_month(month)))  

    visits = []
    for index, _data in enumerate(_visits):
        visits.append([_data[0], _data[1], compute_benchmark(_data[1], index)])

    data['trends'] = visits
    data['trends_type'] = trends_type
    data['cost'] = _costs
    return data

def outpatient_claim(request):
    population = request.GET.get('population', '')
    geography = request.GET.get('geography', '')
    plan = request.GET.get('plan', '')
    claimsdriver = request.GET.get('claimsdriver', '')
    
    final_data = {}
    final_data['costdriver'] = compute_costdrivers(geography, plan, claimsdriver, OutpatientCostDriver)
    final_data['visittrend'] = compute_visittrends(geography, plan, claimsdriver, OutpatientVisitTrend)

    return HttpResponse(final_data)

def inpatient_claim(request):
    population = request.GET.get('population', '')
    geography = request.GET.get('geography', '')
    plan = request.GET.get('plan', '')
    claimsdriver = request.GET.get('claimsdriver', '')
    
    final_data = {}
    final_data['costdriver'] = compute_costdrivers(geography, plan, claimsdriver, InpatientCostDriver)
    final_data['visittrend'] = compute_visittrends(geography, plan, claimsdriver, InpatientVisitTrend)
    final_data['visittrend']['discount'] = [['Rolling Quarter', 35, 38], ['Rolling 12 Months', 33,39]]

    objs = StayAnalysis.objects.all()

    if geography:
        objs = objs.filter(geography=geography)
    if plan:
        objs = objs.filter(plan=plan)
    if claimsdriver:
        objs = objs.filter(claimsdriver=claimsdriver)

    total, data = {}, {}
    for obj in objs:
        stay = total.get(obj.quarter, {'total':0, 'days':0})
        stay['total'] += obj.total
        stay['days'] += obj.days
        total[obj.quarter] = stay

    _total, avg = [], []
    for k, _data in total.iteritems():
        _total.append([k, _data['days']])
        avg.append([k, round(float(_data['days'])/_data['total'], 2)])

    total, _avg = [], []
    for index, value in enumerate(_total):
        total.append([value[0], value[1], compute_benchmark(value[1], index)])

    for index, value in enumerate(avg):
        _avg.append([value[0], value[1], compute_benchmark(value[1], index)])

    data['total'] = total
    data['avg'] = _avg

    final_data['stayanalysis'] = data

    data = {}
    objs = InpatientReadmissions.objects.filter(population='All')

    obj = objs[0]
    data['analysis'] = json.loads(obj.analysis)
    final_data['readmissions'] = data
    
    return HttpResponse(final_data)
