;(function (global, angular) {
  "use strict";

  angular.module("filter")
         .component("filter", {

           "templateUrl": global.templateUrl + "/filter.html",
           "controller" : function () {

             this.onChange = function (value) {

               this.update({"value": value});
             };
           },
           "bindings": {

             "name"       : "<",
             "filterTitle": "<",
             "values"     : "<",
             "selected"   : "<",
             "type"       : "<",
             "none"       : "<",
             "update"     : "&"
           }
         });
}(window.APP = window.APP || {}, window.angular));
