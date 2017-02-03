;(function (global, angular) {
  "use strict";

  angular.module("tab")
         .component("tab", {

           templateUrl: global.templateUrl + "/tab.html",
           controller : ["$anchorScroll", "$window",
             function ($anchorScroll, $window) {

               this.updateTabFilters = function (filters) {

                 this.updateSelectedFilters({"filters": filters,
                                             "tabName": this.tabData.name});
               }

               if (this.tabData.subnav) {

                 this.activeSubnav = this.tabData.subnav[0][1];

                 this.anchorScroll = function (event, id) {

                   event.preventDefault();

                   var scrollTop = document.body.scrollTop;

                   if (!scrollTop) {

                     scrollTop = document.documentElement.scrollTop;
                   }

                   this.activeSubnav = id;
                   $anchorScroll(id);

                   document.body.scrollTop = scrollTop;
                   document.documentElement.scrollTop = scrollTop;
                 };
               }
             }
           ],
           bindings: {

             "tabData": "<",
             "updateSelectedFilters": "&"
           }
         });

}(window.APP = window.APP || {}, window.angular));
