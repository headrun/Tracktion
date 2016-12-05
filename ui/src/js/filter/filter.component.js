;(function (angular) {
  "use strict";

  angular.module("filter")
         .component("filter", {

           "templateUrl": "/js/filter/filter.html",
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
}(window.angular));
