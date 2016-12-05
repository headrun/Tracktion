;(function (angular) {
  "use strict";

  angular.module("filterBar")
         .component("filterBar", {

           "templateUrl": "/js/filterBar/filterBar.html",
           "controller": function () {

             this.updateFilter = function (filterName, filterVal) {

               var filters = angular.extend({}, this.selectedFilters);

               if (!filterVal) {

                 delete filters[filterName];
               } else {

                 filters[filterName] = filterVal;
               }

               this.updateSelectedFilters({"filters": filters});
             };
           },
           "bindings" : {

             "filters"               : "<",
             "filtersOrder"          : "<",
             "selectedFilters"       : "<",
             "updateSelectedFilters" : "&"
           }
         });
}(window.angular));
