;(function (global, angular) {
  "use strict";

  var _ = window._; //underscore.js

  angular.module("summary")
         .component("summary", {
           "templateUrl": global.templateUrl + "/summary.html",
           "controller" : ["$state", "$http", "utils",
             function ($state, $http,  utils) {

               var that = this;

               this.$onInit = function () {

                 this.hideLoading();
                 this.updateActiveTab({"tabName": "dashboard.summary"});
               };
             }],
           "bindings": {

             "updateActiveTab": "&",
             "showLoading": "&",
             "hideLoading": "&"
           }
         });
}(window.APP = window.APP || {}, window.angular));
