# Main Search settings, consists of 6 months of data
SEARCH                = {}
SEARCH['host']        = "http://api.cloudlibs.com/search/"
SEARCH['app_id']      =  "5652f59fc32dab558c00000a"
SEARCH['pipe_id']     = None
SEARCH['pipe_secret'] = None
SEARCH['indexes']     = ["buzzinga"]

facets = {"updated_on":{"date_histogram":{"field":"dt_added","interval":"day","pre_zone":"05:30"}},\
"lang":{"terms":{"field":"xtags","size":10,"regex":".*language_auto$"}},\
"sources":{"terms":{"field":"xtags","size":15,"regex":".*sourcetype_manual.*$"}},\
"sentiment":{"terms":{"field":"xtags","size":10,"regex":".*sentiment_final$"}},\
"city" : {"terms":{"field":"xtags","size":200,"regex":".*city.*$"}},\
"influencers":{"terms_stats":{"key_field":"author.name","value_field":"author_rank","size":50,"order":"max"}},\
"gender":{"terms":{"field":"xtags","size":10,"regex":".*gender_final.*$"}}}

STOP_WORDS = ['a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am', 'among', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'but', 'by', 'can', 'cannot', 'could', 'dear', 'did', 'do', 'does', 'either', 'else', 'ever', 'every', 'for', 'from', 'get', 'got', 'had', 'has', 'have', 'he', 'her', 'hers', 'him', 'his', 'how', 'however', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'just', 'least', 'let', 'like', 'likely', 'may', 'me', 'might', 'most', 'must', 'my', 'neither', 'no', 'nor', 'not', 'of', 'off', 'often', 'on', 'only', 'or', 'other', 'our', 'own', 'rather', 'said', 'say', 'says', 'she', 'should', 'since', 'so', 'some', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this', 'tis', 'to', 'too', 'twas', 'us', 'wants', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'will', 'with', 'would', 'yet', 'you', 'your', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'http', 'www', 'com', 't.co', "https", "org"]

source_keys = " AND (((xtags:facebook_search_sourcetype_manual OR xtags:facebook_search_sourcetype_manual_parent OR xtags:fbpages_sourcetype_manual OR xtags:facebook_comments_sourcetype_manual) AND (  (xtags:usa_country_manual_parent OR xtags:usa_country_auto) )) OR ((xtags:twitter_search_sourcetype_manual OR xtags:twitter_streaming_sourcetype_manual) AND (  xtags:usa_country_auto )) OR (((xtags:focused_crawlers_sourcetype_manual OR xtags:rss_sourcetype_manual) AND  xtags:news_sourcetype_manual_parent ) AND (  xtags:usa_country_manual_parent )) OR ((xtags:blogs_sourcetype_manual_parent OR xtags:wordpress_search_sourcetype_manual) AND (  xtags:usa_country_manual_parent )) OR (((xtags:focused_crawlers_sourcetype_manual OR xtags:rss_sourcetype_manual) AND  xtags:forums_sourcetype_manual_parent ) AND (  xtags:usa_country_manual_parent )) OR ((xtags:googleplus_search_sourcetype_manual) AND (  xtags:usa_country_auto )) OR ((xtags:youtube_search_sourcetype_manual)) OR ((xtags:flickr_search_sourcetype_manual)) OR ((xtags:instagram_search_sourcetype_manual) AND (  xtags:usa_country_auto )) OR ((xtags:tumblr_search_sourcetype_manual)) OR ((xtags:linkedin_search_sourcetype_manual))) -(xtags:1143_blacklisted_article_manual)"
