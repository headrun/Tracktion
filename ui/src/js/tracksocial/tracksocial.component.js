;(function (angular) {
  "use strict";

  var _ = window._; //underscore.js

  function controller ($scope, $state, $http, Highcharts, utils ) {

    var that = this;

    this.stateName = $state.current.name;

    this.tabName = $state.params.tabName;

    this.intarciasrc = {};

    this.diabsourcedist= {};

    this.highchartintarciatimeline = {};

    this.intarciatimelinedata=[];

    this.sourcedist_total=0;

    $scope.parseFloat = parseFloat;

    var scopeName = this.stateName.split(".")[1];

    var filtersOrder = [];

    var tabName = $state.params.tabName;

    this.tabsOrder = ["Market Watch", "Diabetes World","Intarcia"];

    this.tabs = {

      "Market Watch": {

        "name" : "Market Watch",
        "title": "Market Watch",
        "state": "{}"
      },

      "Diabetes World": {

        "name" : "Diabetes World",
        "title": "Diabetes World",
        "state": "{}"
      },

      "Intarcia": {

        "name" : "Intarcia",
        "title": "Intarcia",
        "state": "{}"  
      },

    };

    console.log(tabName);

    /*chart data */
    this.highchartoption={"chart":{"type":"areaspline","margin":[0,15,60,60],"backgroundColor":"transparent","spacingLeft":0,"spacingRight":0},"credits":{"enabled":false},"title":{"text":""},"xAxis":{"type":"datetime","dateTimeLabelFormats":{"day":"%b %e"},"title":{"enabled":false},"gridLineColor":"#ddd","gridLineWidth":1,"lineWidth":1},"yAxis":{"endOnTick":false,"maxPadding":0.3,"title":{"text": "Mentions"},"gridLineColor":"#ddd","gridLineWidth":1},"plotOptions":{"areaspline":{"fillOpacity":0.45,"dashStyle":"Solid","lineWidth":3,"marker":{"symbol":"circle"},"cursor":"pointer"}},"series": [{"name":"Victoza","color":"#dd301b","data":[[1476489600000,4],[1476576000000,2],[1476662400000,9],[1476748800000,5],[1476835200000,3],[1476921600000,4],[1477008000000,9],[1477094400000,8],[1477180800000,3],[1477267200000,5],[1477353600000,7],[1477440000000,16],[1477526400000,4],[1477612800000,13],[1477699200000,7],[1477785600000,6],[1477872000000,2],[1477958400000,4],[1478044800000,10],[1478131200000,2],[1478217600000,1],[1478304000000,2],[1478390400000,1],[1478476800000,1],[1478563200000,1],[1478649600000,3],[1478736000000,0],[1478822400000,0],[1478908800000,3],[1478995200000,5],[1479081600000,2]]},{"name":"Insulin Glargine","color":"#3498db","data":[[1476489600000,5],[1476576000000,1],[1476662400000,4],[1476748800000,7],[1476835200000,4],[1476921600000,6],[1477008000000,7],[1477094400000,3],[1477180800000,3],[1477267200000,7],[1477353600000,12],[1477440000000,5],[1477526400000,11],[1477612800000,8],[1477699200000,2],[1477785600000,0],[1477872000000,9],[1477958400000,6],[1478044800000,7],[1478131200000,25],[1478217600000,19],[1478304000000,8],[1478390400000,4],[1478476800000,9],[1478563200000,13],[1478649600000,22],[1478736000000,47],[1478822400000,33],[1478908800000,11],[1478995200000,9],[1479081600000,7]]},{"name":"Metformin","color":"#c09853","data":[[1476489600000,9],[1476576000000,7],[1476662400000,14],[1476748800000,7],[1476835200000,10],[1476921600000,9],[1477008000000,9],[1477094400000,14],[1477180800000,15],[1477267200000,4],[1477353600000,9],[1477440000000,8],[1477526400000,41],[1477612800000,49],[1477699200000,32],[1477785600000,43],[1477872000000,39],[1477958400000,40],[1478044800000,34],[1478131200000,31],[1478217600000,53],[1478304000000,28],[1478390400000,29],[1478476800000,28],[1478563200000,43],[1478649600000,41],[1478736000000,64],[1478822400000,47],[1478908800000,31],[1478995200000,40],[1479081600000,19]]},{"name":"Tresiba","color":"#90ed7d","data":[[1476489600000,0],[1476576000000,0],[1476662400000,2],[1476748800000,0],[1476835200000,1],[1476921600000,2],[1477008000000,1],[1477094400000,1],[1477180800000,2],[1477267200000,1],[1477353600000,3],[1477440000000,0],[1477526400000,4],[1477612800000,7],[1477699200000,2],[1477785600000,0],[1477872000000,4],[1477958400000,4],[1478044800000,6],[1478131200000,9],[1478217600000,8],[1478304000000,10],[1478390400000,5],[1478476800000,1],[1478563200000,5],[1478649600000,11],[1478736000000,52],[1478822400000,17],[1478908800000,23],[1478995200000,7],[1479081600000,6]]},{"name":"PDUFA","color":"orange","data":[[1476489600000,1],[1476576000000,1],[1476662400000,3],[1476748800000,15],[1476835200000,2],[1476921600000,1],[1477008000000,5],[1477094400000,5],[1477180800000,0],[1477267200000,4],[1477353600000,3],[1477440000000,3],[1477526400000,3],[1477612800000,7],[1477699200000,0],[1477785600000,0],[1477872000000,3],[1477958400000,6],[1478044800000,13],[1478131200000,31],[1478217600000,36],[1478304000000,8],[1478390400000,2],[1478476800000,34],[1478563200000,23],[1478649600000,18],[1478736000000,12],[1478822400000,5],[1478908800000,7],[1478995200000,7],[1479081600000,4]]},{"name":"Semaglutide","color":"#f7a35c","data":[[1476489600000,2],[1476576000000,0],[1476662400000,0],[1476748800000,0],[1476835200000,0],[1476921600000,0],[1477008000000,0],[1477094400000,0],[1477180800000,0],[1477267200000,1],[1477353600000,0],[1477440000000,0],[1477526400000,0],[1477612800000,1],[1477699200000,1],[1477785600000,0],[1477872000000,1],[1477958400000,0],[1478044800000,0],[1478131200000,0],[1478217600000,0],[1478304000000,0],[1478390400000,0],[1478476800000,0],[1478563200000,0],[1478649600000,1],[1478736000000,22],[1478822400000,31],[1478908800000,15],[1478995200000,0],[1479081600000,3]]}],"tooltip":{"shared":true}}
;

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
          $http.get("http://176.9.181.36:2222/clinicalapi/get_social_media/",{"params":that.timelineparams[j]})
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
                                                 "gridLineColor":"#ddd","gridLineWidth":1},
                                                 "plotOptions":{
                                                                "areaspline":{
                                                                              "fillOpacity":0.45,
                                                                              "dashStyle":"Solid",
                                                                              "lineWidth":3,
                                                                              "marker":{"symbol":"circle"},
                                                                              "cursor":"pointer"}
                                                               },
                                                 "series":[ that.series[0],that.series[1],that.series[2],that.series[3]],
                                                  "tooltip":{"shared":true}
                                           }); 
                               }
                //console.log(that.highchartintarciatimeline);
            });
         })(j);
      }
      for(var i=0;i<that.params.length;i++){
      (function(i){
        $http.get("http://176.9.181.36:2222/clinicalapi/get_social_media/",{"params":that.params[i]}) 
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
                     angular.extend(that.intarciasrc, {
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
                     });

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
      $http.get("http://176.9.181.36:2222/clinicalapi/get_wordcloud/",{"params":{'source':'intarcia'}})
      .then(function(resp){
        if(resp.data.error){
          return;
        }
        console.log(resp.data);
        that.intarcia_word_cloud=resp.data;
        setTimeout(function(){
        $.fn.tagcloud.defaults = {
          size: {start: 14, end: 18, unit: 'pt'},
          color: {start: '#cde', end: '#f52'}
        };
        //$(function () {
          $('.intarcia-word-cloud a').tagcloud();
        //});
        },0);
        
      });
    }
    if(tabName=='Diabetes World'){
      that.params=[
                   {'facet':'sources','source':'diabetes'},
                   {'facet':'gender','source':'diabetes'},
                   {'facet':'influencers','source':'diabetes'},
                   {'facet':'lang','source':'diabetes'},
                  ];
      for(var i=0;i<that.params.length;i++){
        (function(i){
          $http.get("http://176.9.181.36:2222/clinicalapi/get_social_media/",{"params":that.params[i]}) 
            .then(function (resp){
              if(resp.data.error) {
                return;
              }

              switch(i){

                case 0: //sources
                        that.source_dist=resp.data.result.facets.sources.terms.diabetes;
                        //console.log(that.source_dist);
                        for(var j=0;j<that.source_dist.length;j++){
                          if((i!=7)&&(i!=9)){
                            that.sourcedist_total+=that.source_dist[j]['count'];
                          }
                        
                        angular.extend(that.diabsourcedist, {
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
                     });
                    }
                        break;

                case 1: //gender
                        that.diabetes_gender=resp.data.result.facets.gender.terms.diabetes;
                        break;

                case 2: //influencers
                        that.diabetes_influencers=resp.data.result.facets.influencers.terms;
                        break;

                case 3: //lang
                        that.diabetes_lang=resp.data.result.facets.lang.terms.diabetes;
                        break;
              }
            });
        })(i);

      }
       // for word cloud
      $http.get("http://176.9.181.36:2222/clinicalapi/get_wordcloud/",{"params":{'source':'diabetes'}})
      .then(function(resp){
        if(resp.data.error){
          return;
        }   
        console.log(resp.data);
        that.diabetes_word_cloud=resp.data;
        setTimeout(function(){
        $.fn.tagcloud.defaults = { 
          size: {start: 14, end: 18, unit: 'pt'},
          color: {start: '#cde', end: '#f52'}
        };  
        //$(function () {
          $('.diabetes-word-cloud a').tagcloud();
        //});
        },0);
        
      }); 
    }

  }

  angular.module("tracksocial")
         .component("tracksocial", {
           "templateUrl": "/js/tracksocial/tracksocial.html",
           "controller" : ["$scope","$state", "$http", "Highcharts", "utils",
                           controller],
           "bindings": {

             "state": "<",
             "updateDashboardState": "&",
             "updateActiveTab": "&",
             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.angular));
