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
cntry_codes = {'Canada':'ca', 'USA':'us', 'Japan':'jp', 'Korea':'kr', 'Russia':'ru','US':'us',
                'Taiwan':'tw', 'Turkey':'tr', 'China': 'cn', 'Philippines':'ph','Europe':'eu','North America':'na',
                'Asia':'as','South America':'sa'}

def clinicaltrail(request):
    db= MySQLdb.connect(host="localhost",user="root",passwd="root",db="dcube",\
                charset="utf8", use_unicode=True)
    cursor = db.cursor()
    query1 = ""
    if request.GET:
        parameters = request.GET.get("filters","")

        if 'keys' in ''.join(request.GET.keys()):
            query1 = "select distinct trail_status, drug_class, drug_name, end_date, countries from\
                clinical_trail group by trail_status, drug_class, drug_name, end_date, countries;"
            query = "select * from clinical_trail_dev;"
        elif 'nct_id' in ''.join(request.GET.keys()):
            key = ''.join(request.GET.keys())
            value = '%' + ''.join(request.GET.values()) + '%'
            query = "select * from clinical_trail_dev where %s like '%s';" % (key, str(value))
            #query = "select * from clinical_trail_dev;"
        else:
            parameters = request.GET.get("filters",{})
            parameters = json.loads(parameters)
            dropdown_query = clinical_dropdowns_data(parameters)
            print dropdown_query
            """key = ''.join(request.GET.keys())
            value = '%' + ''.join(request.GET.values()) + '%'
            query = "select * from clinical_trail_dev where %s like '%s';" % (key, str(value))"""
            query = "select * from clinical_trail_dev where %s " % (dropdown_query)
            print query
    else:
        query = "select * from clinical_trail_dev;"

    cursor.execute(query)
    rows = cursor.fetchall()

    unique_keys = {}
    if query1:
        cursor.execute(query1)
        u_rows = cursor.fetchall()
        tr_list, drug_list, dr_name_list, end_date_list, count_list = [], [], [], [], []
        for u_row in u_rows:
            trail_stat, drug_cl, dr_name, st_date, count = u_row
            end_year = st_date.split('-')[-1]
            tr_list.append(str(trail_stat))
            drug_list.append(str(drug_cl))
            dr_name_list.append(str(dr_name))
            end_date_list.append(str(end_year))
            for i in count.split(','):
                count_list.append(str(i).strip())

        unique_keys['trail_status'] = list(set(tr_list))
        unique_keys['drug_class']   = list(set(drug_list))
        unique_keys['year_list']    = sorted(list(set(end_date_list)))
        unique_keys['countries']    = list(set(count_list))
        unique_keys['drug_name']    = list(set(dr_name_list))

    phase_dict = {'1' : 'I', '2' : 'II', '3' : 'III'}
    new_data_list = []
    data_list = []
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
                if cntry_codes.has_key(i.strip()):
                    cntry_list.append(cntry_codes[i.strip()])
                else:
                    cntry_list.append(i.strip())

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
    return HttpResponse(json.dumps(new_data_list), content_type='application/json')


def clinicaltrail_summary(request):
    db= MySQLdb.connect(host="localhost",user="root",passwd="root",db="dcube",\
                charset="utf8", use_unicode=True)
    cursor = db.cursor()
    query1 = ""
    if request.GET:
        parameters = request.GET.get("filters","")

        if 'keys' in ''.join(request.GET.keys()):
            query1 = "select distinct trail_status, drug_class, drug_name, end_date, countries from\
                clinical_trail group by trail_status, drug_class, drug_name, end_date, countries;"
            query = "select * from clinical_trail_dev;"
        elif 'nct_id' in ''.join(request.GET.keys()):
            key = ''.join(request.GET.keys())
            value = '%' + ''.join(request.GET.values()) + '%' 
            query = "select * from clinical_trail_dev where %s like '%s';" % (key, str(value))
            #query = "select * from clinical_trail_dev;"
        else:
            parameters = request.GET.get("filters",{})
            parameters = json.loads(parameters)
            dropdown_query = clinical_dropdowns_data(parameters)
            print dropdown_query
            """key = ''.join(request.GET.keys())
            value = '%' + ''.join(request.GET.values()) + '%'
            query = "select * from clinical_trail_dev where %s like '%s';" % (key, str(value))"""
            query = "select * from clinical_trail_dev where %s " % (dropdown_query)
            print query
    else:
        query = "select * from clinical_trail_dev;"

    cursor.execute(query)
    rows = cursor.fetchall()

    unique_keys = {}
    if query1:
        cursor.execute(query1)
        u_rows = cursor.fetchall()
        tr_list, drug_list, dr_name_list, end_date_list, count_list = [], [], [], [], []
        for u_row in u_rows:
            trail_stat, drug_cl, dr_name, st_date, count = u_row
            end_year = st_date.split('-')[-1]
            tr_list.append(str(trail_stat))
            drug_list.append(str(drug_cl))
            dr_name_list.append(str(dr_name))
            end_date_list.append(str(end_year))
            for i in count.split(','):
                count_list.append(str(i).strip())

        unique_keys['trail_status'] = list(set(tr_list))
        unique_keys['drug_class']   = list(set(drug_list))
        unique_keys['year_list']    = sorted(list(set(end_date_list)))
        unique_keys['countries']    = list(set(count_list))
        unique_keys['drug_name']    = list(set(dr_name_list))

    phase_dict = {'1' : 'I', '2' : 'II', '3' : 'III'}
   
    new_data_list = []
    data_list = []
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
                if cntry_codes.has_key(i.strip()):
                    cntry_list.append(cntry_codes[i.strip()])
                else:
                    cntry_list.append(i.strip())

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

        new_data_list.append(clinical_dict)

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

    #return HttpResponse(json.dumps(data_list), content_type='application/json')
    return HttpResponse(json.dumps(new_data_list), content_type='application/json')









def clinical_dropdowns_data(dropdown_inputs):
    divide_query = ''
    final_dropdown = {}
    for drp_key,drp_inputs in dropdown_inputs.iteritems():
        if drp_inputs :
            if drp_key == 'status' :
                final_dropdown['trail_status'] = drp_inputs
            else:
                final_dropdown[drp_key] = drp_inputs
    for dr_input, dr_values in final_dropdown.iteritems():
        dr_value = [str(k) for k in dr_values]
        if dr_value[0][0] == '[':
            all_query_values = json.loads(dr_value[0])
            dr_value = [str(k) for k in all_query_values]
        if dr_input in ['end_date','location']:
            pass
        elif final_dropdown.keys()[0] == dr_input :
            if len(dr_value)>1:
                divide_query = divide_query+'%s in %s ' % (dr_input, tuple(dr_value))
            else:
                divide_query = divide_query+'%s in ("%s") ' % (dr_input, dr_value[0])
        else:
            if len(dr_value)>1:
                divide_query = divide_query+'and %s in %s ' % (dr_input, tuple(dr_value))
            else:
                divide_query = divide_query+'and %s in ("%s") ' % (dr_input, dr_value[0])
    if final_dropdown.has_key('end_date'):
        dates=[str(k) for k in final_dropdown['end_date']]
        if dates[0][0] == '[':
            all_query_values = json.loads(dates[0])
            dates = [str(k) for k in all_query_values]
        end_dates = '|'.join(dates)
        if not divide_query : 
            divide_query = divide_query +'end_date REGEXP "%s" ' % (end_dates)
        elif divide_query[-1] == ';':
            divide_query = divide_query[:-1] + ' and end_date REGEXP "%s";' % (end_dates) 
        else:
            divide_query = divide_query +'and end_date REGEXP "%s" ' % (end_dates)
    if final_dropdown.has_key('location'):
        locs=[str(loc) for loc in final_dropdown['location']]
        if locs[0][0] == '[':
            all_query_values = json.loads(locs[0])
            locs = [str(k) for k in all_query_values]

        end_dates = '|'.join(locs)
        if not divide_query : 
            divide_query = divide_query +'countries REGEXP "%s" ' % (end_dates)
        elif divide_query[-1] == ';':
            divide_query = divide_query[:-1] + ' and countries REGEXP "%s";' % (end_dates) 
        else:
            divide_query = divide_query +'and countries REGEXP "%s" ' % (end_dates)


    return divide_query


def get_wordcloud(request):
    source = request.GET.get('source', 'intarcia')

    word_query = ''.join(get_query(source))

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

    query_eses = get_query(source)

    variable_dict = {}
    for query_es in query_eses:
        if sentiment:
            query_es += ' AND (xtags:' + sentiment + '_sentiment_final)'

        if facet:
            facet_value = facets[facet]
            facets_v = {facet : facet_value}

        if 'influencer' in facet:
            query_es += '((xtags:twitter_search_sourcetype_manual OR \
                xtags:twitter_streaming_sourcetype_manual) AND (  xtags:usa_country_auto ))'

        if source == 'marketwatch':
            var = query_es.split(' AND ')[0].replace('"', '').replace('(', '')
        else:
            var = source

        records = search.search(query={"query":{"query_string":{"query":query_es,\
            "fields":search_fields,"use_dis_max":True}},"size":size, "facets": facets_v,\
            "sort":[{"dt_added":{"order":"desc"}}]},indexes=SEARCH["indexes"],\
            doc_types="item",query_params={"scroll":"15m"})


        if facet:
            if facet not in no_need_perc_cal:
                variable = records['result']['facets'][facet]['terms']
                counts = sum([item['count'] for item in variable])
                variable_list = []
                city_variable_dict = {}
                if facet =='city':
                    f = open('/var/www/NewTracktion/Tracktion/backend/clinical/city_state.txt')
                    for line in f:
                        n_lines = line
                    f.close()
                    states_data = json.loads(n_lines[:-1])
                for gen in variable:
                    count = gen['count']
                    category = gen['term']
                    if 'lang' in facet:
                        gen['term'] = category.split('_')[0]
                    perc = round(float(count)/float(counts)*100, 2)
                    gen['perc'] = perc
                    if facet =='city':
                        city_name = gen['term'].split('_')[0]
                        if states_data.has_key(city_name):
                            gen['state_name'] = states_data[city_name]['state_name']
                            gen['state_abbreviation'] = states_data[city_name]['state_abbreviation']
                            city_variable_dict[gen['state_abbreviation']] = gen 
                    variable_list.append(gen)
                variable_dict[var] = variable_list
                if facet =='city':
                    variable_dict[var] = city_variable_dict
                records['result']['facets'][facet]['terms'] = variable_dict
            else:
                if 'updated_on' in facet:
                    variable_dict[var] = records['result']['facets'][facet]['entries']
                    records['result']['facets'][facet]['entries'] = variable_dict

    return HttpResponse(json.dumps(records), content_type='application/json')

def get_query(source):
    days = 30
    wquery = ''
    objs = SocialAPI.objects.filter(source=source)

    values = objs.values_list('source', 'query', 'sources', 'days',\
        'added_by', 'created_at', 'modified_at', 'last_seen')
    if values:
        source, wquery, sources, days, added_by, created_at,\
            modified_at, last_seen = values[0]

    old_date = str((curdate + datetime.timedelta(-days)).date())
    dt_qry = " AND (dt_added :[" + old_date + " TO " + str(curdate.date()) + "])"

    qry_list = []
    if source == 'marketwatch':
        wquerys = wquery.split(' OR ')
        for i in wquerys:
            wqry = '(' + i + source_keys + dt_qry + ')'
            qry_list.append(wqry)

        wquery = qry_list

    else:
        wquery += dt_qry
        wquery = [wquery]

    return wquery
