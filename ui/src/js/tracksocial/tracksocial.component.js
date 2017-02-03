;(function (global, angular) {
  "use strict";

  var _ = window._; //underscore.js

  function controller ($scope, $state, $http, Highcharts, utils, $timeout ) {

    var that = this;

    this.stateName = $state.current.name;

    this.tabName = $state.params.tabName;

    this.intarciasrc = {};

    this.diabsourcedist= {};

    this.highchartintarciatimeline = {};

    this.intarciatimelinedata=[];

    this.sourcedist_total=0;

    this.highchartoption={};

    this.highchartoptionloader=true;

    $scope.parseFloat = parseFloat;

    var scopeName = this.stateName.split(".")[1];

    var filtersOrder = [];

    var tabName = $state.params.tabName;

    this.tabsOrder = ["Intarcia","Market Watch","Influencers"];

    this.tabs = {

      "Market Watch": {

        "name" : "Market Watch",
        "title": "Market Watch",
        "state": "{}"
      },

      "Influencers": {

        "name" : "Influencers",
        "title": "Influencers",
        "state": "{}"
      },

      "Intarcia": {

        "name" : "Intarcia",
        "title": "Intarcia",
        "state": "{}"  
      },

    };

    this.mentionsByColors = {
      "#258cd1" : "Overall",
      "#5cb85c" : "Positive",
      "#f0ad4e" : "Neutral",
      "#e5412d" : "Negative",
    };

    this.drugNamesMarketWatch = {
      "#dd301b" : "Janumet",
      "#3498db" : "Jardiance",
      "#c09853" : "Invokana",
      "#90ed7d" : "Victoza",
      "orange"  : "Januvia",
      "#f7a35c" : "Trulicity",
    };

    this.drugNamesInfluencers = {
      "#3498db" : "Overall",
      "#90ed7d" : "Patient",
      "#dd301b" : "Others",
      "#c09853" : "Alliedhcp",
      "orange"  : "Doctor",
    };

    console.log(tabName);


    this.modalHeading = "Something";
    this.articles = [];
    this.scrollId = "";
    this.respTotal = "";

    this.loadArticleModal = function(url, title, scroll){
      that.showLoading();
      $http.get(url)
        .then(function(resp){
          if (resp.statusText == "OK") {
            
            resp = resp.data.result;
            console.log(resp);
            $('#articleModal').modal('show');
            $timeout(function () {

              $scope.$apply(function () {
                if (scroll == '' || typeof scroll == 'undefined') {
                  that.modalHeading = title;
                  that.scrollId = resp._scroll_id;
                  that.articles = resp.hits.hits;
                  that.respTotal = resp.hits.total;
                }else{
                  that.scrollId = resp._scroll_id;
                  that.respTotal = resp.hits.total;
                  that.articles = that.articles.concat(resp.hits.hits);
                }
              });
              that.hideLoading();
            });
          }
      });
    }

    this.loadMore = function(scrollId){
      var url = domainUrl+"clinicalapi/search_scroll/?scroll_id="+scrollId;
      that.loadArticleModal(url, '', 'scroll');
    }

    this.updatePaneState = function (filters,tabName) {
	  updateFilters(filters, tabName);

      this.updateDashboardState({"name": "tracksocial",
                                 "state": filters});
    };

    this.updateActiveTab({"tabName": "dashboard.tracksocial"});

    var selectedFilters = this.state.dashboard[scopeName];

    if (!tabName) {


      $state.go($state.current.name,
                {"tabName": this.tabsOrder[0],
                 "state"  : selectedFilters});
    } else {

      this.hideLoading();

      this.activeTab = tabName;
    }

    if(tabName=='Intarcia'){
      that.showLoading();
      that.timelineparams=[{'facet':'updated_on','source':tabName},
                          {'facet':'updated_on','source':tabName,'sentiment':'positive'},
                          {'facet':'updated_on','source':tabName,'sentiment':'negative'},
                          {'facet':'updated_on','source':tabName,'sentiment':'neutral'}
                        ];

      that.params=[
                   {'facet':'sentiment','source':tabName},
                   {'facet':'sources','source':tabName},
                   {'facet':'gender','source':tabName},
                   {'facet':'influencers','source':tabName},
                   {'facet':'lang','source':tabName},
                  ];

      for(var j=0;j<that.timelineparams.length;j++){
        (function(j){ 
          $http.get(domainUrl+"clinicalapi/get_social_media/",{"params":that.timelineparams[j]})
          .then(function (resp){
                if(resp.data.error) {
                  return;
                }
               // console.log(resp.data);
                that.intarciatimelinedata[j]=resp.data.result.facets.updated_on.entries.Intarcia;
                if(that.intarciatimelinedata.length==that.timelineparams.length){
                  that.series=[];
                  for(var z=0;z<that.intarciatimelinedata.length;z++){
                    that.data=[];
                    angular.forEach(that.intarciatimelinedata[z], function(value, key) {
                      that.data.push([value.time , value.count]);
                    });
                    if(z==0){
                      that.series[z]={"color":"#258cd1","name":"overall","data":that.data};
                    } 
                    if(z==1){
                      that.series[z]={"color":"#5cb85c","name":"positive","data":that.data};
                    }
                    if(z==2){
                      that.series[z]={"color":"#e5412d","name":"negative","data":that.data};
                    }
                    if(z==3){
                      that.series[z]={"color":"#f0ad4e","name":"netural","data":that.data};
                    }
                  }
                  // console.log(that.series);
                  angular.extend(that.highchartintarciatimeline, {
                            "chart":{
                                      "type":"areaspline",
                                      "margin":[0,15,60,60],
                                      "backgroundColor":"transparent",
                                      "spacingLeft":0,"spacingRight":0
                                    },
                            "credits":{"enabled":false},
                            "title":{"text":""},
                            "xAxis":{
                                     "type":"datetime",
                                     "dateTimeLabelFormats":{"day":"%b %e"},
                                     "title":{"enabled":false},
                                     "gridLineColor":"#ddd",
                                     "gridLineWidth":1,
                                     "lineWidth":1
                                    },
                            "yAxis":{
                                     "endOnTick":false,
                                     "maxPadding":0.3,
                                     "title":{"text": "Mentions"},
                                     "gridLineColor":"#ddd","gridLineWidth":1
                                   },
                           "plotOptions":{
                                "areaspline":{
                                    "fillOpacity":0.45,
                                    "dashStyle":"Solid",
                                    "lineWidth":3,
                                    "marker":{"symbol":"circle"},
                                    "cursor":"pointer",
                                    "point" : {
                                        "events" : {
                                            "click" : function(event){
                                                var d = new Date(event.point.x);
                                                var dateFormat = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
                                                var sentiment = that.mentionsByColors[event.point.color];
                                                var url = "";
                                                if (sentiment == "Overall") {
                                                  url = domainUrl+"clinicalapi/get_articles/?source=intarcia&date="+dateFormat;
                                                }else{
                                                  url = domainUrl+"clinicalapi/get_articles/?source=intarcia&date="+dateFormat+"&sentiment="+sentiment;
                                                }
                                                var title = sentiment+" Impressions on "+dateFormat;
                                                that.loadArticleModal(url, title);
                                            }
                                        }
                                    }
                                }

                            },
                           "series":[ that.series[0],that.series[1],that.series[2],that.series[3]],
                            "tooltip":{"shared":true}
                     }); 
                   that.hideLoading();
                  }
                  //console.log(that.highchartintarciatimeline);
            });
         })(j);
      }
      for(var i=0;i<that.params.length;i++){
      (function(i){
        $http.get(domainUrl+"clinicalapi/get_social_media/",{"params":that.params[i]}) 
          .then(function (resp){
            if(resp.data.error) {
              return;
            }
            //console.log(resp.data.result.facets);
            switch(i){
              case 0:
                     //sentiment
                     //console.log(resp.data.result.facets);
                     that.summarywidgets=resp.data.result.facets.sentiment.terms;
                     break;
              case 1:
                    //source distribution
                    // console.log(resp.data.result.facets);
                     that.source_dist=resp.data.result.facets.sources.terms.Intarcia;
                     for(var j=0;j<that.source_dist.length;j++){
                       if((i!=7)&&(i!=9)){
                         that.sourcedist_total+=that.source_dist[j]['count'];
                       }
                     }
                     /*angular.extend(that.intarciasrc, {
                                "chart":{"backgroundColor": "transparent"},
                                "credits":{"enabled":false},
                                "title":{"text":""},
                                "plotOptions":{
                                               "pie":{

                                                       "borderWidth":1,
                                                       "allowPointSelect":true,
                                                       "cursor":"pointer",
                                                       "dataLabels":{"enabled":false},
                                                       "showInLegend":true,
                                                       "slicedOffset":0,
                                                       "innerSize":"60%",
                                                       "series":{"shadow":true}
                                                    }   
                                              },  
                                "legend":{"enabled":false},
                                "series": [{"data":[
                                                   {"name":"Twitter","y":that.source_dist[0]['count'],"color":"#00BEF6","visible":true},
                                                   {"name":"Rss","y":that.source_dist[1]['count'],"color":"#ff0084","visible":true},
                                                   {"name":"News","y":that.source_dist[2]['count'],"color":"#CC9900","visible":true},
                                                   {"name":"Instagram","y":that.source_dist[3]['count'],"color":"#4C3D32","visible":true},
                                                   {"name":"Googleplus","y":that.source_dist[4]['count'],"color":"#DD4B39","visible":true},
                                                   {"name":"Blogs","y":that.source_dist[5]['count'],"color":"#FF8833","visible":true},
                                                   {"name":"Tumblr","y":that.source_dist[6]['count'],"color":"#529ECC","visible":true},
                                                   {"name":"Forums","y":that.source_dist[8]['count'],"color":"#CC6600","visible":true},
                                                   {"name":"Facebook","y":that.source_dist[10]['count'],"color":"#3B5998","visible":true},
                                                   ],  
                                            "type":"pie",
                                            "name":"<small>#Articles</small>",
                                            "num_articles":39316
                                            }]  
                     });*/

                    break;
              case 2:
                    //gender classification
                    //console.log(resp.data.result.facets);
                    that.gendersummary=resp.data.result.facets.gender.terms.Intarcia;
                    break;
              case 3:
                    //twitter top influencers
                    //console.log(resp.data.result.facets);
                    that.top_influencers=resp.data.result.facets.influencers.terms;
                    //console.log(that.top_influencers);
                    break;
              case 4:
                    //languages
                    //console.log(resp.data.result.facets);
                    that.languages=resp.data.result.facets.lang.terms.Intarcia;
                    //console.log(that.languages);
                    break;
              default:
                    break;
            }
          })
        })(i);
      }
      // for word cloud
      that.intarcia_word_cloud_loading=true;
      $http.get(domainUrl+"clinicalapi/get_wordcloud/",{"params":{'source':'intarcia'}})
      .then(function(resp){
        if(resp.data.error){
          return;
        }
        console.log(resp.data);
        that.intarcia_word_cloud_loading=false;
        that.intarcia_word_cloud=resp.data;
        setTimeout(function(){
        $.fn.tagcloud.defaults = {
          size: {start: 18, end: 30, unit: 'pt'},
          color: {start: '#327fc5', end: '#f52'}
        };
        //$(function () {
          $('.intarcia-word-cloud a').tagcloud();
        //});
        },0);
        
      });

      //Getting language Articles
      that.showLangArticles = function(langName){
        if (langName != '' || typeof langName != 'undefined') {
          var url = domainUrl+"clinicalapi/get_articles/?lang_name="+langName+"&source=intarcia";
          var title = "language Articles";
          loadArticleModal(url, title);
          
        }
      }
    }
    if(tabName=='Market Watch'){
      that.showLoading();
      that.params=[
                   {'facet':'updated_on','source':'marketwatch'},
                  // {'facet':'influencers','source':'marketwatch'},
                  ];

      for(var i=0;i<that.params.length;i++){
        (function(i){
          $http.get(domainUrl+"clinicalapi/get_social_media/",{"params":that.params[i]}) 
            .then(function (resp){
              if(resp.data.error) {
                return;
              }
               switch(i){

                case 0: //sources
                        that.market_watch_timeline_data=resp.data.result.facets.updated_on.entries;
                        that.series=[];
                        that.timelinecolor=["#dd301b","#3498db","#c09853","#90ed7d","orange","#f7a35c"];
                        that.index=0;
                        console.log(that.market_watch_timeline_data);
                        angular.forEach(that.market_watch_timeline_data,function(value,key){
                          that.data=[];
                          angular.forEach(value, function(value1, key1) {
                            that.data.push([value1.time , value1.count]);
                          });
                          that.series.push({"color":that.timelinecolor[that.index],"name":key,"data":that.data});
                          that.index++;
                        });
                        console.log(that.series);
                        angular.extend(that.highchartoption, {
                            "chart":{
                                      "type":"areaspline",
                                      "margin":[0,15,60,60],
                                      "backgroundColor":"transparent",
                                      "spacingLeft":0,"spacingRight":0
                                    },
                            "credits":{"enabled":false},
                            "title":{"text":""},
                            "xAxis":{
                                     "type":"datetime",
                                     "dateTimeLabelFormats":{"day":"%b %e"},
                                     "title":{"enabled":false},
                                     "gridLineColor":"#ddd",
                                     "gridLineWidth":1,
                                     "lineWidth":1
                                    },
                            "yAxis":{
                                     "endOnTick":false,
                                     "maxPadding":0.3,
                                     "title":{"text": "Mentions"},
                                     "gridLineColor":"#ddd","gridLineWidth":1},
                                     "plotOptions":{
                                        "areaspline":{
                                            "fillOpacity":0.45,
                                            "dashStyle":"Solid",
                                            "lineWidth":3,
                                            "marker":{"symbol":"circle"},
                                            "cursor":"pointer",
                                            "point" : {
                                                "events" : {
                                                    "click" : function(event){
                                                        var d = new Date(event.point.x);
                                                        var dateFormat = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
                                                        var drugName = that.drugNamesMarketWatch[event.point.color];
                                                        var url = domainUrl+"clinicalapi/get_articles/?source=marketwatch&date="+dateFormat+"&key_word="+drugName;
                                                        var title = drugName+" Impressions on "+dateFormat;
                                                        that.loadArticleModal(url, title);
                                                    }
                                                }
                                            }
                                         }
                                       },
                           "series":that.series,
                            "tooltip":{"shared":true}
                  });
                   // that.highchartoptionloader=false;
                   that.hideLoading();
                   break;
               }
            });
        })(i);
       }

      // Drug Dropdown 
      $http.get(domainUrl+"clinicalapi/wordcloud_dropdown/?source=marketwatch")
      .then(function(resp){
        if(resp.data.error){
          return;
        }
        that.drugsDropdown = resp.data.dr_values;
      });

      // for word cloud
      this.loadMarketwatchWordCloud = function(drugName){
        that.marketwatch_word_cloud_loading=true;
        var url = "";
        if (drugName != "" && typeof drugName != "undefined") {
          url = domainUrl+"clinicalapi/get_wordcloud/?source=marketwatch&key_word="+drugName;
        }else{
          url = domainUrl+"clinicalapi/get_wordcloud/?source=marketwatch&key_word=Januvia";
        }
        $http.get(url)
        .then(function(resp){
          if(resp.data.error){
            return;
          }
          that.marketwatch_word_cloud_loading=false;
          //console.log(resp.data);
          that.market_word_cloud=resp.data;
          setTimeout(function(){
          $.fn.tagcloud.defaults = { 
            size: {start: 18, end: 30, unit: 'pt'},
            color: {start: '#327fc5', end: '#f52'}
          };  
          //$(function () 
            $('.marketwatch-word-cloud a').tagcloud();
          //});
          },0);
          
        });
      }

      this.loadMarketwatchWordCloud();
    
    }

    if(tabName=='Influencers'){
      that.showLoading();
      that.params=[
                   {'facet':'updated_on','source':'influencers'},
                  ];

      for(var i=0;i<that.params.length;i++){
        (function(i){
          $http.get(domainUrl+"clinicalapi/get_social_media/",{"params":that.params[i]}) 
            .then(function (resp){
              if(resp.data.error) {
                return;
              }
               switch(i){

                case 0: //sources
                        that.market_watch_timeline_data=resp.data.result.facets.updated_on.entries;
                        that.series=[];
                        that.timelinecolor=["#dd301b","#3498db","#c09853","#90ed7d","orange","#f7a35c"];
                        that.index=0;
                        console.log(that.market_watch_timeline_data);
                        angular.forEach(that.market_watch_timeline_data,function(value,key){
                          that.data=[];
                          angular.forEach(value, function(value1, key1) {
                            that.data.push([value1.time , value1.count]);
                          });
                          that.series.push({"color":that.timelinecolor[that.index],"name":key,"data":that.data});
                          that.index++;
                        });
                        console.log(that.series);
                        angular.extend(that.highchartoption, {
                            "chart":{
                                      "type":"areaspline",
                                      "margin":[0,15,60,60],
                                      "backgroundColor":"transparent",
                                      "spacingLeft":0,"spacingRight":0
                                    },
                            "credits":{"enabled":false},
                            "title":{"text":""},
                            "xAxis":{
                                     "type":"datetime",
                                     "dateTimeLabelFormats":{"day":"%b %e"},
                                     "title":{"enabled":false},
                                     "gridLineColor":"#ddd",
                                     "gridLineWidth":1,
                                     "lineWidth":1
                                    },
                            "yAxis":{
                                     "endOnTick":false,
                                     "maxPadding":0.3,
                                     "title":{"text": "Mentions"},
                                     "gridLineColor":"#ddd","gridLineWidth":1},
                                     "plotOptions":{
                                        "areaspline":{
                                            "fillOpacity":0.45,
                                            "dashStyle":"Solid",
                                            "lineWidth":3,
                                            "marker":{"symbol":"circle"},
                                            "cursor":"pointer",
                                            "point" : {
                                                "events" : {
                                                    "click" : function(event){
                                                        var d = new Date(event.point.x);
                                                        var dateFormat = d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
                                                        var drugName = that.drugNamesInfluencers[event.point.color];
                                                        var url = "";
                                                        if (drugName == "Overall") {
                                                          url = domainUrl+"clinicalapi/get_articles/?source=influencers&date="+dateFormat;
                                                        }else{
                                                          url = domainUrl+"clinicalapi/get_articles/?source=influencers&date="+dateFormat+"&key_word="+drugName+"_dcube_influencers_project_manual";
                                                        }
                                                        var title = drugName+" Impressions on "+dateFormat;
                                                        that.loadArticleModal(url, title);
                                                    }
                                                }
                                            }
                                         }
                                       },
                           "series":that.series,
                            "tooltip":{"shared":true}
                  });
                   // that.highchartoptionloader=false;
                   that.hideLoading();
                   break;
               }
            });
        })(i);
       }

       //Top Doctors
       $http.get(domainUrl+"clinicalapi/get_social_media/?facet=influencers&source=influencers&infr_type=doctor_dcube_influencers_project_manual")
        .then(function(resp){
          if(resp.data.error){
            return;
          }
          that.topDoctors = resp.data.result.facets.influencers.terms;
        });


       //Top patiennts
       $http.get(domainUrl+"clinicalapi/get_social_media/?facet=influencers&source=influencers&infr_type=patient_dcube_influencers_project_manual")
        .then(function(resp){
          if(resp.data.error){
            return;
          }
          that.topPatients = resp.data.result.facets.influencers.terms;
        });


       //Top Allied HCP
       $http.get(domainUrl+"clinicalapi/get_social_media/?facet=influencers&source=influencers&infr_type=alliedhcp_dcube_influencers_project_manual")
        .then(function(resp){
          if(resp.data.error){
            return;
          }
          that.topAlliedHps = resp.data.result.facets.influencers.terms;
        });  


      // Drug Dropdown 
      $http.get(domainUrl+"clinicalapi/wordcloud_dropdown/?source=influencers")
      .then(function(resp){
        if(resp.data.error){
          return;
        }
        that.drugsDropdown = resp.data.dr_values;
      });

      // for word cloud
      this.loadMarketwatchWordCloud = function(drugName){
        that.marketwatch_word_cloud_loading=true;
        var url = "";
        if (drugName != "" && typeof drugName != "undefined") {
          url = domainUrl+"clinicalapi/get_wordcloud/?source=influencers&key_word="+drugName+"_dcube_influencers_project_manual";
        }else{
          url = domainUrl+"clinicalapi/get_wordcloud/?source=influencers&key_word=alliedhcp_dcube_influencers_project_manual";
        }
        $http.get(url)
        .then(function(resp){
          if(resp.data.error){
            return;
          }
          that.marketwatch_word_cloud_loading=false;
          //console.log(resp.data);
          that.market_word_cloud=resp.data;
          setTimeout(function(){
          $.fn.tagcloud.defaults = { 
            size: {start: 18, end: 30, unit: 'pt'},
            color: {start: '#327fc5', end: '#f52'}
          };  
          //$(function () 
            $('.marketwatch-word-cloud a').tagcloud();
          //});
          },0);
          
        });
      }

      this.loadMarketwatchWordCloud();
    
    }

  }

  angular.module("tracksocial")
         .component("tracksocial", {
           "templateUrl": "/js/tracksocial/tracksocial.html",
           "controller" : ["$scope","$state", "$http", "Highcharts", "utils", "$timeout",
                           controller],
           "bindings": {

             "state": "<",
             "updateDashboardState": "&",
             "updateActiveTab": "&",
             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.APP = window.APP || {}, window.angular));
