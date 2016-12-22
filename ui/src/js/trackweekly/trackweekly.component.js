;(function (angular) {
  "use strict";

  var _ = window._; //underscore.js

  function controller ($state, $http, Highcharts, utils) {

    var that = this;

    this.stateName = $state.current.name;

    this.tabName = $state.params.tabName;

    var scopeName = this.stateName.split(".")[1];

    var filtersOrder = [];

    var tabName = $state.params.tabName;

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
            console.log(that.clinical_summary);
          })
       

        this.hideLoading();
      }
    }
/*
    this.clinical_summary=[{"drug_name":"Semaglutide","trial_data":[{
      "primary_endpoint": "Time from randomisation to first occurrence of a MACE, defined as cardiovascular death, non-fatal myocardial infarction, or non-fatal stroke [ Time Frame: Time from randomisation up to end of follow-up",
      "trial_status": "Completed",
      "end_date": "1Q-2016",
      "countries": [
        "Global"
      ],
      "othername": "SUSTAIN-6",
      "drug_class": "GLP-1",
      "drug_name": "Semaglutide",
      "source": "http://www.medscape.com/viewarticle/862644\n",
      "phase": "III",
      "patient_number": 3297,
      "trail_title": "A Long-term, Randomised, Double-blind, Placebo-controlled, Multinational, Multi-centre Trial to Evaluate Cardiovascular and Other Long-term Outcomes With Semaglutide in Subjects With Type 2 Diabetes (SUSTAIN™ 6 - Long-term Outcomes)",
      "start_date": "1Q-2013",
      "pcd": "1Q-2016",
      "nct_id": "NCT01720446"
    },{
      "primary_endpoint": "Change from baseline in HbA1c at Week26",
      "trial_status": "Recruiting",
      "end_date": "4Q-2017",
      "countries": [
        "US",
        "Europe",
        "Japan"
      ],
      "othername": "PIONEER-1",
      "drug_class": "GLP-1",
      "drug_name": "Semaglutide",
      "source": "",
      "phase": "III",
      "patient_number": 704,
      "trail_title": "Efficacy and Safety of Oral Semaglutide Versus Placebo in Subjects With Type 2 Diabetes Mellitus Treated With Diet and Exercise Only",
      "start_date": "3Q-2016",
      "pcd": "4Q-2017",
      "nct_id": "NCT02906930"
    },]}];*/
    console.log(this.clinical_summary);
  }

  angular.module("trackweekly")
         .component("trackweekly", {
           "templateUrl": "/js/trackweekly/trackweekly.html",
           "controller" : ["$state", "$http", "Highcharts", "utils",
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
