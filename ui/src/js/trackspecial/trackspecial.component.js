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

      this.updateDashboardState({"name": "trackspecial",
                                  "state": filters});
    };

    this.updateActiveTab({"tabName": "dashboard.trackspecial"});

    var selectedFilters = this.state.dashboard[scopeName];
    this.hideLoading();
  }

  angular.module("trackspecial")
         .component("trackspecial", {

           "templateUrl": global.templateUrl + "/trackspecial.html",
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
