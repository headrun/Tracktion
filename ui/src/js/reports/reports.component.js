;(function (global, angular) {
  "use strict";

  var _ = window._;

 function controller ($state, $http, Highcharts, utils) {

    var that = this;

    this.stateName = $state.current.name;

    var scopeName = this.stateName.split(".")[1];

    var tabName = $state.params.tabName;

    var filtersOrder = [];

    this.tabsOrder = [];

    this.updatePaneState = function (filters, tabName) {
      updateFilters(filters, tabName);

      this.updateDashboardState({"name": "reports",
                                  "state": filters});
    };

    this.updateActiveTab({"tabName": "dashboard.reports"});

    var selectedFilters = this.state.dashboard[scopeName];
/*
    if (!tabName) {
      $state.go($state.current.name,
                  {"tabName": this.tabsOrder[0],
                  "state"  : selectedFilters});
    } else {

      this.hideLoading();

      this.activeTab = tabName;
    }
*/
    this.hideLoading();
  }

  angular.module("reports")
         .component("reports", {

           "templateUrl": global.templateUrl + "/reports.html",
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

}(window.APP = window.APP || {}, window.angular));
