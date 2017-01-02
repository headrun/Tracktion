import xlrd
import MySQLdb
import requests
from django.shortcuts import render
from django.conf import settings
import urllib
import json

from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.template import Context, loader

from django.views.decorators.csrf import csrf_exempt

from cloudlibs import proxy
from settings import *

size = 3
search_fields =  ['title', 'text']
search = proxy(SEARCH['host'], SEARCH['app_id'])

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
    return HttpResponse('Came here')

def get_social_media(request):
    if 'keys' in ''.join(request.GET.keys()):
        records =  search.search(query={"query":{"query_string":{"query": word_query,"fields":["title","text"],"use_dis_max":True}},"size":0,"aggs":{"words":{"terms":{"field":'text', "size":10}}},"highlight":{"fields":{"title":{},"text":{}}}},indexes=SEARCH["indexes"],doc_types="item",query_params={"scroll":"15m"})
        records = records["result"]["aggregations"]["words"]["buckets"]
        num_results = len(records)
        last_article_timestamp = None
        count = 0
        list_words = []
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
             list_words.append(_freq_words)
             list_words.append(word_count)
        return HttpResponse(json.dumps(list_words), content_type='application/json')

    else:
        if 'facet' in ''.join(request.GET.keys()):
            value = ''.join(request.GET.values())
            key_value = facets[value]
            facets_v = {value : key_value}
        else:
            facets_v = facets
        records = search.search(query={"query":{"query_string":{"query":query,\
            "fields":search_fields,"use_dis_max":True}},"size":size, "facets": facets_v,\
            "sort":[{"dt_added":{"order":"desc"}}]},indexes=SEARCH["indexes"],\
            doc_types="item",query_params={"scroll":"15m"})

        return HttpResponse(json.dumps(records), content_type='application/json')
