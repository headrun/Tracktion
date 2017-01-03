import xlrd
import MySQLdb
import requests
from django.shortcuts import render
from django.conf import settings
import urllib
import json
import datetime

from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.template import Context, loader

from django.views.decorators.csrf import csrf_exempt

from cloudlibs import proxy
from settings import *
from models import *

size = 0
search_fields =  ['title', 'text']
search = proxy(SEARCH['host'], SEARCH['app_id'])

curdate = datetime.datetime.now()
no_need_perc_cal = ['sentiment', 'updated_on', 'influencers']

def clinicaltrail(request):
    db= MySQLdb.connect(host="localhost",user="root",passwd="root",db="dcube",\
                charset="utf8", use_unicode=True)
    cursor = db.cursor()
    query1 = ""
    if request.GET:
        if 'keys' in ''.join(request.GET.keys()):
            query1 = "select distinct trail_status, drug_class, drug_name, start_date, countries from\
                clinical_trail group by trail_status, drug_class, drug_name, start_date, countries;"
            query = "select * from clinical_trail;"
        else:
            key = ''.join(request.GET.keys())
            value = '%' + ''.join(request.GET.values()) + '%'
            query = "select * from clinical_trail where %s like '%s';" % (key, str(value))
    else:
        query = "select * from clinical_trail;"

    cursor.execute(query)
    rows = cursor.fetchall()

    unique_keys = {}
    if query1:
        cursor.execute(query1)
        u_rows = cursor.fetchall()
        tr_list, drug_list, dr_name_list, st_date_list, count_list = [], [], [], [], []
        for u_row in u_rows:
            trail_stat, drug_cl, dr_name, st_date, count = u_row
            s_year = st_date.split('-')[-1]
            tr_list.append(str(trail_stat))
            drug_list.append(str(drug_cl))
            dr_name_list.append(str(dr_name))
            st_date_list.append(str(s_year))
            for i in count.split(','):
                count_list.append(str(i).strip())

        unique_keys['trail_status'] = list(set(tr_list))
        unique_keys['drug_class']   = list(set(drug_list))
        unique_keys['year_list']    = sorted(list(set(st_date_list)))
        unique_keys['countries']    = list(set(count_list))
        unique_keys['drug_name']    = list(set(dr_name_list))

    phase_dict = {'1' : 'I', '2' : 'II', '3' : 'III'}

    new_dict = {}
    for row in rows:
        clinical_dict = {}
        nct_id, othername, trail_title, drug_name, alternate_name, phase, drug_class,\
            start_date, end_date, pcd, patient_number, primary_enpoint, trial_status, \
            countries, results, company, colalborator, truncated_title, \
            source, craeted_at, modified_at, last_seen = row

        phasev = phase_dict[str(phase)]

        cntry_list = []
        if countries:
            countries = countries.split(', ')
            for i in countries:
                cntry_list.append(i)

        clinical_dict['nct_id']         = nct_id
        clinical_dict['othername']      = othername
        clinical_dict['trail_title']    = trail_title
        clinical_dict['drug_name']      = drug_name
        clinical_dict['phase']          = phasev
        clinical_dict['start_date']     = start_date
        clinical_dict['end_date']       = end_date
        clinical_dict['pcd']            = pcd
        clinical_dict['patient_number'] = patient_number
        clinical_dict['primary_endpoint'] = primary_enpoint
        clinical_dict['trial_status']   = trial_status
        clinical_dict['countries']      = cntry_list
        clinical_dict['results']        = results
        clinical_dict['source']         = source
        clinical_dict['drug_class']     = drug_class
        clinical_dict['alternate_name'] = alternate_name
        clinical_dict['company']        = company
        clinical_dict['colalborator']   = colalborator
        clinical_dict['truncated_title']= truncated_title

        if new_dict.get(drug_name):
            new_dict[drug_name].append(clinical_dict)
        else:
            new_dict[drug_name] = [clinical_dict]

        data_list = []
        if unique_keys:
            data_list.append(unique_keys)
        else:
            for key, values in new_dict.iteritems():
                data_dict = {}
                data_dict['drug_name']  = key
                data_dict['trial_data'] = values
                data_list.append(data_dict)

    return HttpResponse(json.dumps(data_list), content_type='application/json')

def get_wordcloud(request):
    source = request.GET.get('source', 'intarcia')

    word_query = get_query(source)

    records =  search.search(query={"query":{"query_string":{"query": word_query,"fields":["title","text"],"use_dis_max":True}},"size":0,"aggs":{"words":{"terms":{"field":'text', "size":200}}},"highlight":{"fields":{"title":{},"text":{}}}},indexes=SEARCH["indexes"],doc_types="item",query_params={"scroll":"15m"})

    records = records["result"]["aggregations"]["words"]["buckets"]
    num_results = len(records)
    last_article_timestamp = None
    count = 0
    _freq_words = {}
    words_mapping = {}
    for record in records:
         if count > 49: break
         key = record["key"]
         word_count = record["doc_count"]
         if isinstance(key, unicode) or (len(key) > 2 and (key not in STOP_WORDS)):
            _freq_words[key] = word_count
            words_mapping[key] = key
            count += 1

    return HttpResponse(json.dumps(_freq_words), content_type='application/json')

def get_social_media(request):
    facet = request.GET.get('facet', '')
    sentiment = request.GET.get('sentiment', '')
    source = request.GET.get('source', 'intarcia')

    facets_v = {}

    query_es = get_query(source)

    if sentiment:
        query_es += ' AND (xtags:' + sentiment + '_sentiment_final)'

    if facet:
        facet_value = facets[facet]
        facets_v = {facet : facet_value}

    if 'influencer' in facet:
        query_es += '((xtags:twitter_search_sourcetype_manual OR \
            xtags:twitter_streaming_sourcetype_manual) AND (  xtags:usa_country_auto ))'

    records = search.search(query={"query":{"query_string":{"query":query_es,\
        "fields":search_fields,"use_dis_max":True}},"size":size, "facets": facets_v,\
        "sort":[{"dt_added":{"order":"desc"}}]},indexes=SEARCH["indexes"],\
        doc_types="item",query_params={"scroll":"15m"})

    if facet:
        if facet not in no_need_perc_cal:
            variable = records['result']['facets'][facet]['terms']
            counts = sum([item['count'] for item in variable])
            variable_list = []
            for gen in variable:
                count = gen['count']
                category = gen['term']
                perc = round(float(count)/float(counts)*100, 2)
                gen['perc'] = perc
                variable_list.append(gen)

            records['result']['facets'][facet]['terms'] = variable_list

    return HttpResponse(json.dumps(records), content_type='application/json')

def get_query(source):
    objs = SocialAPI.objects.filter(source=source)

    wquery = ''
    days = 1
    values = objs.values_list('source', 'query', 'sources', 'days',\
            'added_by', 'created_at', 'modified_at', 'last_seen')
    if values:
        source, wquery, sources, days, added_by, created_at,\
            modified_at, last_seen = values[0]

    old_date = str((curdate + datetime.timedelta(-days)).date())

    wquery += " AND (dt_added :[" + old_date + " TO " + str(curdate.date()) + "])"

    return wquery
