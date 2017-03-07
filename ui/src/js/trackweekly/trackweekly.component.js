;(function (global, angular) {
  "use strict";

  var _ = window._; //underscore.js

  function controller ($scope,$state, $http, Highcharts, utils) {

    var that = this;


    this.select_first = false;
    this.select_filter = true;


    var stateData = this.state.dashboard.trackweekly && JSON.parse(this.state.dashboard.trackweekly) || {};

    this.stateName = $state.current.name;

    this.tabName = $state.params.tabName;

    var scopeName = this.stateName.split(".")[1];

    var filtersOrder = [];

    var tabName = $state.params.tabName;

    this.filterkeys;
    this.ang_list;
    this.ang_dict;
    this.allSelected = false;
    this.cbChecked;

    this.selected_filter='status';

    this.tabsOrder = ["Clinical Trail Summary", "Clinical Data","News"];

    this.tabs = {

      "Clinical Trail Summary": {

        "name" : "Clinical Trail Summary",
        "title": "Clinical Trial Map",
        "state": "{}"
      },

      "Clinical Data": {

        "name" : "clinical Data",
        "title": "Clinical Trial Summary",
        "state": "{}"
      },

      "News": {

        "name" : "News",
        "title": "News",
        "state": "{}"  
      },

    };

      this.updatePaneState = function (filters,tabName) {
	updateFilters(filters, tabName);

      this.updateDashboardState({"name": "trackweekly",
                                 "state": filters});
    };

    this.updateActiveTab({"tabName": "dashboard.trackweekly"});

    var selectedFilters = this.state.dashboard[scopeName];

    that.click_toggle = function(){
      this.select_first = true;
      this.select_filter = false;
    }

    that.adjustbars=function(){
      setTimeout(function(){
        for(var i=0;i<that.clinical_summary.length;i++){
          for(var j=0;j<that.clinical_summary[i].trial_data.length;j++){
            var enc_start_year=that.clinical_summary[i].trial_data[j].start_date;
            var enc_end_year=that.clinical_summary[i].trial_data[j].end_date;
            var enc_pcd_year=that.clinical_summary[i].trial_data[j].pcd;

            var start_temp= enc_start_year.split("-");
            var end_temp= enc_end_year.split("-");
            if(enc_pcd_year!=''){
              var pcd_temp=enc_pcd_year.split("-");
            }
            var start_yr= parseInt(start_temp[1]);
            var end_yr= parseInt(end_temp[1]);
            if(enc_pcd_year!=''){
              var pcd_yr= parseInt(pcd_temp[1]);
            }
            var start_qtr= start_temp[0];
            var end_qtr= end_temp[0];
            if(enc_pcd_year!=''){
              var pcd_qtr= pcd_temp[0];
            }
            var marginleft=0;
            var marginextra=0;
            var nct_id=that.clinical_summary[i].trial_data[j].nct_id;
            var flag2=0;
            if(end_yr > 2020) {
              end_yr=2020;
              end_qtr="4Q";
            }
            if(start_yr < 2014){
              start_yr=2014;
              start_qtr='1Q';
              flag2=1; 
            }
            var qtr=$(".qtr").outerWidth();
            var extraspace=$(".extraspace").outerWidth();
            var statusspace=$(".status").outerWidth();
            var yearspace=$(".year").outerWidth();
            if(start_yr >= 2014){
                marginextra=(extraspace-statusspace);
                marginextra-=10;

              marginleft+=((start_yr-2014)*4);
              if(start_qtr=='2Q'){ marginleft+=1;}
              if(start_qtr=='3Q'){ marginleft+=2;}
              if(start_qtr=='4Q'){ marginleft+=3;}
                
             // console.log(nct_id+ "   (" + end_yr +"-" +start_yr+")+1 *4 * 38  "+  start_qtr +"   "+ end_qtr+ "  "+ marginleft ); 
            }
            var prog_size=(((end_yr-start_yr)+1)*4);
            if(start_qtr=='2Q') {
              prog_size-=1;
            }
            if(start_qtr=='3Q') {
              prog_size-=2;
            }
            if(start_qtr=='4Q'){
              prog_size-=3;
            }
            if(end_qtr=='3Q') {
              prog_size-=1;
            }
            if(end_qtr=='2Q') {
              prog_size-=2;
            }
            if(end_qtr=='1Q'){
              prog_size-=3;
            }
            //console.log(nct_id+ "   (" + end_yr +"-" +start_yr+")+1 *4 * 38  "+  start_qtr +"   "+ end_qtr+ "  "+ prog_size );
            prog_size=prog_size*qtr;
            marginleft=marginleft*qtr;
            if(flag2){marginleft-=((extraspace-statusspace)-8);prog_size+=((extraspace-statusspace)-8);}
            $(".prgbar"+nct_id).css('width',prog_size+"px");
            var prog_size_store = prog_size;
            prog_size=prog_size+qtr;
            //$(".status-prgbar-container"+nct_id).css('width',prog_size+"px");
            $(".prgbar"+nct_id).css('margin-left',(marginleft+marginextra)+"px");
            $(".status-prgbar-container"+nct_id).css('float',"left");
            var pcd_margin=5;
            if(enc_pcd_year!=''){
              if(end_yr-pcd_yr!=0){
                pcd_margin+=(end_yr-pcd_yr)*yearspace;
              }
              console.log('working');
              switch(end_qtr){
                case '2Q':
                         if(pcd_qtr=='1Q'){pcd_margin+=qtr;}
                         break;
                case '3Q':
                         if(pcd_qtr=='1Q'){pcd_margin+=(2*qtr);}
                         if(pcd_qtr=='2Q'){pcd_margin+=qtr;}
                         break;
                case '4Q':
                         if(pcd_qtr=='1Q'){pcd_margin+=(3*qtr);}
                         if(pcd_qtr=='2Q'){pcd_margin+=(2*qtr);}
                         if(pcd_qtr=='3Q'){pcd_margin+=qtr;}
                         break;
              }
            }
            pcd_margin+=qtr/2;
            $(".yellowbar"+nct_id).css("margin-left",-pcd_margin+"px");
            $(".progress-bar"+nct_id).css("width", (prog_size_store-pcd_margin)+"px");
          }
        }
      },0);

    }

    if (!tabName) {


      $state.go($state.current.name,
                {"tabName": this.tabsOrder[0],
                 "state"  : selectedFilters});
    } else {

      this.activeTab = tabName;

      if(tabName == "Clinical Trail Summary"){
        $http.get(domainUrl+"clinicalapi/clinicaltrail/")
          .then(function (resp){
            if(resp.data.error) {
               return;
            }
            console.log(resp.data);
            that.clinical_summary=resp.data;
            that.adjustbars();
           })
        $http.get(domainUrl+"clinicalapi/clinicaltrail/",{"params":{'keys':'filterkeys'}})
          .then(function(resp){
            if(resp.data.error) {
              return;
            }
            var ang_list = [];
            that.ang_dict = {};
            var ang_dict_keys = [];
            angular.forEach( resp.data[0], function(val, key) {
              ang_list=[];
              angular.forEach( val, function(v) {
                ang_list.push({ 'label' : v, 'checked' : false });
              });
              that.ang_dict[key] = ang_list;
              ang_dict_keys.push(key);
            });
            that.filterkeys=resp.data[0];
            
            angular.forEach(ang_dict_keys, function(values) {
              that.toggleAll(values);
            });
            //console.log(resp.data[0].trail_status);
            //console.log(that.filterkeys);
          })

          that.cbChecked = function(key_name){
            that.allSelected[key_name] = true;
            angular.forEach(that.ang_dict[key_name], function(v, k) {
              if(!v.checked){
                that.allSelected[key_name] = false;
              }
            });
          }
    
          that.toggleAll = function(key_name) {
            var bool = true;
            if (that.allSelected[key_name]) {
              bool = false;
            }
            angular.forEach(that.ang_dict[key_name], function(v, k) {
              v.checked = !bool;
              that.allSelected[key_name] = !bool;
            });
          }

        that.vertical_line_appear = function() {
          $('.trail-detail-data').on('mousemove', null, [$('#vertical')],function(e){
              e.data[0].css('left', e.originalEvent.layerX);
              //e.data[0].css('top', e.offsetY==undefined?e.originalEvent.layerY:e.offsetY);
              console.log(e.offsetX==undefined?e.originalEvent.layerX:e.offsetX);
              //e.data[0].hide();
          });
          $('.trail-detail-data').on('mouseenter', null, [$('#vertical')], function(e){
              e.data[0].show();
              //e.data[1].show();
              //e.data[0].hide();
            }).on('mouseleave', null, [$('#vertical')], function(e){
              e.data[0].hide();
              //e.data[1].hide();
            });
        }

        that.filterformsubmit=function(filtersdata){
          
          var filtersdata = {};
          angular.forEach(that.ang_dict, function(val, key) {
            var data_list = [];
            angular.forEach(val, function(arr) {
              if(arr.checked == true) {
                data_list.push(arr.label);
              }
            })
            if(data_list.length>=1){
              filtersdata[key] = [];
              
              if (key=="year_list"){
                filtersdata["end_date"] = data_list;
              }
              else if (key=="countries"){
                filtersdata["location"] = data_list;
              }
              else{
                filtersdata[key] = data_list;
              }
            }
          });
          

          if(typeof(filtersdata)!="undefined"){
            console.log(filtersdata);
            $http.get(domainUrl+"clinicalapi/clinicaltrail/",
                      {"params":{"filters":filtersdata}})
               .then(function (resp){
                 if(resp.data.error) {
                 return;
                 }   
                 setTimeout(function(){
                 $scope.$apply(function(){
                     that.clinical_summary=resp.data;
                     that.adjustbars();
                 }); 
                 },0);
            });
          }
        }

        this.hideLoading();
      } else {

        if(typeof(stateData.id) != "undefined"){
          that.showLoading();
          console.log(stateData.id);
          $http.get(domainUrl+"clinicalapi/clinicaltrail_summary",
                      {"params":{"nct_id":stateData.id}})
               .then(function (resp){
                 if(resp.data.error) {
                 return;
                 }
                 console.log(resp.data);
                 that.trials=resp.data;
                 /* 
                 setTimeout(function(){  
                 $scope.$apply(function(){
                     that.clinical_summary=resp.data;
                     that.adjustbars();
                 }); 
                 },0);
                 */
          });
          that.hideLoading();
        }else{
          that.showLoading();
          $http.get(domainUrl+"clinicalapi/clinicaltrail_summary")
               .then(function (resp){
                 if(resp.data.error) {
                 return;
                 }   
                 console.log(resp.data);
                 that.trials=resp.data;
                 /*  
                 setTimeout(function(){  
                 $scope.$apply(function(){
                     that.clinical_summary=resp.data;
                     that.adjustbars();
                 }); 
                 },0);
                 */
          }); 
          that.hideLoading(); 
        }

      }
    }
  }

  angular.module("trackweekly")
         .component("trackweekly", {
           "templateUrl": global.templateUrl + "/trackweekly.html",
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
}(window.APP = window.APP || {}, window.angular));
