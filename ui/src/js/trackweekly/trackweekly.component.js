;(function (angular) {
  "use strict";

  var _ = window._; //underscore.js

  function controller ($scope,$state, $http, Highcharts, utils) {

    var that = this;

    this.stateName = $state.current.name;

    this.tabName = $state.params.tabName;

    var scopeName = this.stateName.split(".")[1];

    var filtersOrder = [];

    var tabName = $state.params.tabName;

    this.filterkeys;

    this.selected_filter='status';

    this.tabsOrder = ["Clinical Trail Summary", "Clinical Data","News"];

    this.tabs = {

      "Clinical Trail Summary": {

        "name" : "Clinical Trail Summary",
        "title": "Clinical Trail Summary",
        "state": "{}"
      },

      "Clinical Data": {

        "name" : "clinical Data",
        "title": "Clinical Data",
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

    that.adjustbars=function(){
      setTimeout(function(){
        for(var i=0;i<that.clinical_summary.length;i++){
          for(var j=0;j<that.clinical_summary[i].trial_data.length;j++){
            var enc_start_year=that.clinical_summary[i].trial_data[j].start_date;
            var enc_end_year=that.clinical_summary[i].trial_data[j].end_date;

            var start_temp= enc_start_year.split("-");
            var end_temp= enc_end_year.split("-");

            var start_yr= parseInt(start_temp[1]);
            var end_yr= parseInt(end_temp[1]);
            var start_qtr= start_temp[0];
            var end_qtr= end_temp[0];
            var flag=0;
            var marginleft=0;
            var nct_id=that.clinical_summary[i].trial_data[j].nct_id;

            if(end_yr > 2020) {
              end_yr=2020;
              end_qtr="4Q";
            }
            if(start_yr < 2014){
              start_yr=2014;
              start_qtr='1Q';
              flag=1;
            }
            if(start_yr >= 2014){
              if(!flag){
                marginleft+=50;
              }
              marginleft+=((start_yr-2014)*4)*38;
              if(start_qtr=='2Q'){ marginleft+=38;}
              if(start_qtr=='3Q'){ marginleft+=76;}
              if(start_qtr=='4Q'){ marginleft+=114;}
                
             /*
             var  x=(((end_yr-start_yr)+1)*4)*38;
              marginleft+=x;
              //marginleft+= (((end_yr-start_yr)+1)*4)*38;
             // console.log(nct_id+ "   (" + end_yr +"-" +start_yr+")+1 *4 * 38  "+  start_qtr +"   "+ end_qtr+ "  "+ marginleft );
            
            if(start_qtr=='2Q'){
              marginleft-=38;
            }   
            if(start_qtr=='3Q'){
              marginleft-=76;
            }   
            if(start_qtr=='4Q'){
              marginleft-=114;
            }*/
            /*
            if(end_qtr=='3Q'){
              marginleft-=38;
            }
            if(end_qtr=='2Q'){
              marginleft-=76;
            }
            if(end_qtr=='1Q'){
              marginleft-=114;
            }
         */
             // console.log(nct_id+ "   (" + end_yr +"-" +start_yr+")+1 *4 * 38  "+  start_qtr +"   "+ end_qtr+ "  "+ marginleft ); 
            }
            var prog_size=(((end_yr-start_yr)+1)*4)*38;
            if(start_qtr=='2Q') {
              prog_size-=38;
            }
            if(start_qtr=='3Q') {
              prog_size-=76;
            }
            if(start_qtr=='4Q'){
              prog_size-=114;
            }
            if(end_qtr=='3Q') {
              prog_size-=38;
            }
            if(end_qtr=='2Q') {
              prog_size-=76;
            }
            if(end_qtr=='1Q'){
              prog_size-=114;
            }
            console.log(nct_id+ "   (" + end_yr +"-" +start_yr+")+1 *4 * 38  "+  start_qtr +"   "+ end_qtr+ "  "+ prog_size );
            if(flag){
              prog_size+=50;
            }
            $(".prgbar"+nct_id).css('width',prog_size+"px");
            $(".prgbar"+nct_id).css('margin-left',marginleft+"px");
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
        $http.get("http://176.9.181.36:2222/clinicalapi/clinicaltrail/")
          .then(function (resp){
            if(resp.data.error) {
               return;
            }
            console.log(resp.data);
            that.clinical_summary=resp.data;
            that.adjustbars();
           })
        $http.get("http://176.9.181.36:2222/clinicalapi/clinicaltrail/",{"params":{'keys':'filterkeys'}})
          .then(function(resp){
            if(resp.data.error) {
              return;
            }
            that.filterkeys=resp.data[0];
            console.log(resp.data[0].trail_status);
            console.log(that.filterkeys);
          })

        that.searchbytype=function(searchelement){
           // that.selected_filter='status';
            console.log(this.selected_filter);
            console.log(searchelement);
            var pa;
            if(that.selected_filter=='status'){
              pa={'trail_status':searchelement};
            }
            if(that.selected_filter=='drug_class'){
              pa={'drug_class':searchelement};
            }
            if(that.selected_filter=='year'){
              pa={'start_date':searchelement};
            }
            if(that.selected_filter=='location'){
              pa={'countries':searchelement};
            }
            if(that.selected_filter=='drugName'){
              pa={'drug_name':searchelement}; 
            }
            console.log(pa);
            $http.get("http://176.9.181.36:2222/clinicalapi/clinicaltrail/",
                     {"params":pa })
              .then(function (resp){
                if(resp.data.error) {
                return;
                }
               // console.log(resp.data);
                setTimeout(function(){
                $scope.$apply(function(){
                    that.clinical_summary=resp.data;
                    that.adjustbars();
                });
                },0);
                console.log(resp.data);
              });
          };

        this.hideLoading();
      }
    }
  }

  angular.module("trackweekly")
         .component("trackweekly", {
           "templateUrl": "/js/trackweekly/trackweekly.html",
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
