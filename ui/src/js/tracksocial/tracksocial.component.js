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
  }

  angular.module("tracksocial")
         .component("tracksocial", {
           "templateUrl": "/js/tracksocial/tracksocial.html",
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
