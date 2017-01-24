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

    this.highchartoption={};

    this.highchartoptionloader=true;

    $scope.parseFloat = parseFloat;

    var scopeName = this.stateName.split(".")[1];

    var filtersOrder = [];

    var tabName = $state.params.tabName;

    this.tabsOrder = ["Intarcia","Market Watch"];

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
    }
    if(tabName=='Diabetes World'){
      that.showLoading();
      that.params=[
                   {'facet':'sources','source':'diabetes'},
                   {'facet':'gender','source':'diabetes'},
                   {'facet':'influencers','source':'diabetes'},
                   {'facet':'lang','source':'diabetes'},
                  ];
          setTimeout(function(){
            var map_container = $('#map').parent();
            var p_height = $(map_container).height();
            var p_width = $(map_container).width();
            $('#map').css({'height' : p_height,'width' : p_width,'padding-left': '120px'})
               .find('svg').attr('width', p_width);
            var stateDetails = {"WA":{"count":123,"name":"Washington"},"DE":{"count":30,"name":"Delaware"},"DC":{"count":0,"name":"District Of Columbia"},"WI":{"count":345,"name":"Wisconsin"},"WV":{"count":38,"name":"West Virginia"},"HI":{"count":0,"name":"Hawaii"},"FL":{"count":674,"name":"Florida"},"WY":{"count":15,"name":"Wyoming"},"NH":{"count":94,"name":"New Hampshire"},"NJ":{"count":87,"name":"New Jersey"},"NM":{"count":13,"name":"New Mexico"},"TX":{"count":1651,"name":"Texas"},"LA":{"count":538,"name":"Louisiana"},"NC":{"count":968,"name":"North Carolina"},"ND":{"count":0,"name":"North Dakota"},"NE":{"count":163,"name":"Nebraska"},"TN":{"count":314,"name":"Tennessee"},"NY":{"count":194,"name":"New York"},"PA":{"count":924,"name":"Pennsylvania"},"AK":{"count":0,"name":"Alaska"},"NV":{"count":4,"name":"Nevada"},"VA":{"count":123,"name":"Virginia"},"GU":{"count":0,"name":"Guam"},"CO":{"count":266,"name":"Colorado"},"VI":{"count":0,"name":"Virgin Islands"},"CA":{"count":397,"name":"California"},"AL":{"count":174,"name":"Alabama"},"AR":{"count":84,"name":"Arkansas"},"VT":{"count":50,"name":"Vermont"},"IL":{"count":1067,"name":"Illinois"},"GA":{"count":955,"name":"Georgia"},"IN":{"count":725,"name":"Indiana"},"IA":{"count":224,"name":"Iowa"},"MA":{"count":273,"name":"Massachusetts"},"AZ":{"count":260,"name":"Arizona"},"ID":{"count":7,"name":"Idaho"},"CT":{"count":22,"name":"Connecticut"},"ME":{"count":34,"name":"Maine"},"MD":{"count":93,"name":"Maryland"},"OK":{"count":502,"name":"Oklahoma"},"OH":{"count":806,"name":"Ohio"},"UT":{"count":549,"name":"Utah"},"MO":{"count":706,"name":"Missouri"},"MN":{"count":674,"name":"Minnesota"},"MI":{"count":416,"name":"Michigan"},"RI":{"count":9,"name":"Rhode Island"},"KS":{"count":139,"name":"Kansas"},"MT":{"count":0,"name":"Montana"},"MS":{"count":158,"name":"Mississippi"},"PR":{"count":0,"name":"Puerto Rico"},"SC":{"count":116,"name":"South Carolina"},"KY":{"count":173,"name":"Kentucky"},"OR":{"count":484,"name":"Oregon"},"SD":{"count":58,"name":"South Dakota"}};
           
           var $tooltip = $("#map-tooltip");
//           $('#map').usmap({});
           $('#map').usmap({

    showLabels: false,
    stateSpecificStyles: {"WA":{"fill":"#ecffec"},"DE":{"fill":"#fafffa"},"DC":{"fill":"#ffffff"},"WI":{"fill":"#caffca"},"WV":{"fill":"#f9fff9"},"HI":{"fill":"#ffffff"},"FL":{"fill":"#97ff97"},"WY":{"fill":"#fdfffd"},"NH":{"fill":"#f0fff0"},"NJ":{"fill":"#f2fff2"},"NM":{"fill":"#fdfffd"},"TX":{"fill":"#00ff00"},"LA":{"fill":"#acffac"},"NC":{"fill":"#69ff69"},"ND":{"fill":"#ffffff"},"NE":{"fill":"#e6ffe6"},"TN":{"fill":"#cfffcf"},"NY":{"fill":"#e1ffe1"},"PA":{"fill":"#70ff70"},"AK":{"fill":"#ffffff"},"NV":{"fill":"#fefffe"},"VA":{"fill":"#ecffec"},"GU":{"fill":"#ffffff"},"CO":{"fill":"#d6ffd6"},"VI":{"fill":"#ffffff"},"CA":{"fill":"#c2ffc2"},"AL":{"fill":"#e4ffe4"},"AR":{"fill":"#f2fff2"},"VT":{"fill":"#f7fff7"},"IL":{"fill":"#5aff5a"},"GA":{"fill":"#6bff6b"},"IN":{"fill":"#8fff8f"},"IA":{"fill":"#dcffdc"},"MA":{"fill":"#d5ffd5"},"AZ":{"fill":"#d7ffd7"},"ID":{"fill":"#fefffe"},"CT":{"fill":"#fcfffc"},"ME":{"fill":"#fafffa"},"MD":{"fill":"#f1fff1"},"OK":{"fill":"#b1ffb1"},"OH":{"fill":"#83ff83"},"UT":{"fill":"#aaffaa"},"MO":{"fill":"#92ff92"},"MN":{"fill":"#97ff97"},"MI":{"fill":"#bfffbf"},"RI":{"fill":"#fefffe"},"KS":{"fill":"#eaffea"},"MT":{"fill":"#ffffff"},"MS":{"fill":"#e7ffe7"},"PR":{"fill":"#ffffff"},"SC":{"fill":"#edffed"},"KY":{"fill":"#e4ffe4"},"OR":{"fill":"#b4ffb4"},"SD":{"fill":"#f6fff6"}},
    mouseover: function(event, data) {
      var detail = stateDetails[data.name];
      
      var position = $(data.hitArea.node).offset();
      event = event.originalEvent;
      
      $tooltip.css({
                "position": "fixed",
                "top": position.top + 20 + "px",
                "left": position.left + 50 + "px"
              })
              .addClass("fade in")
              .find(".tooltip-inner")
              .text(detail.name + " : "
                    +detail.count+" Articles");
    },
    mouseout: function(event, data) {
      $tooltip.removeClass("fade in");
    }
  });

      }, 0);
      for(var i=0;i<that.params.length;i++){
        (function(i){
          $http.get(domainUrl+"clinicalapi/get_social_media/",{"params":that.params[i]}) 
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
                     that.hideLoading();
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
      that.diabetes_word_cloud_loading=true;
      $http.get(domainUrl+"clinicalapi/get_wordcloud/",{"params":{'source':'diabetes'}})
      .then(function(resp){
        if(resp.data.error){
          return;
        }   
        //console.log(resp.data);
        that.diabetes_word_cloud_loading=false;
        that.diabetes_word_cloud=resp.data;
        setTimeout(function(){
        $.fn.tagcloud.defaults = { 
          size: {start: 18, end: 30, unit: 'pt'},
          color: {start: '#327fc5', end: '#f52'}
        };  
        //$(function () {
          $('.diabetes-word-cloud a').tagcloud();
        //});
        },0);
        
      }); 
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
                                                                              "cursor":"pointer"}
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

    // for word cloud
      that.marketwatch_word_cloud_loading=true;
      $http.get(domainUrl+"clinicalapi/get_wordcloud/",{"params":{'source':'marketwatch'}})
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
