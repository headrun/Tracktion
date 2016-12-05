;(function (angular) {
  "use strict";

  var _ = window._; //underscore.js

  angular.module("summary")
         .component("summary", {
           "templateUrl": "/js/summary/summary.html",
           "controller" : ["$state", "$http", "utils",
             function ($state, $http,  utils) {

               var that = this;

               this.hideLoading();
               this.updateActiveTab({"tabName": "dashboard.summary"});
             }],
           "bindings": {

             "updateActiveTab": "&",
             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.angular));
