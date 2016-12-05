;(function (angular) {
  "use strict";

  angular.module("header")
         .component("header", {
           "templateUrl": "/js/header/header.html",
           "controller" : ["$rootScope", "$state", "$filter", "$interval",
             function ($rootScope, $state, $filter, $interval) {

               var that = this;

               this.collapsed = true;

               this.tabs = [
                            {"name"  : "dashboard.summary",
                             "text"  : "Summary",
                             "params": {"state": ""}
                            },
                            {"name"  : "dashboard.trackweekly",
                             "text"  : "Track Weekly",
                             "params": {

                               "state": this.states
                             }
                            },
			    {"name"  : "dashboard.trackspecial",
                             "text"  : "Track Special",
                             "params": {

                               "state": this.states
                             }
                            },
			    {"name"  : "dashboard.tracksocial",
                             "text"  : "Track Social",
                             "params": {

                               "state": this.states
                             }
                            },
			    {"name"  : "dashboard.reports",
                             "text"  : "Reports",
                             "params": {

                               "state": this.states
                             }
                            }
                           ];

               this.toggleCollapse = function () {

                 this.collapsed = !this.collapsed;
               };

               function onNavigation (event, next, params) {

                 that.collapsed = true;
               }

               var bindedEvents = [];

               function bindEvents () {

                 bindedEvents.push($rootScope.$on("$stateChangeStart", onNavigation));
               }

               function unbindEvents () {

                 angular.forEach(bindedEvents, function (unbindFunc) {

                   unbindFunc();
                 });
               }

               this.$onInit = bindEvents;

               this.$onDestroy = unbindEvents;
             }
           ],
           "bindings": {

             "states": "<",
             "activeTab": "<"
           }
         });
}(window.angular));
