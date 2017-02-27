;(function (global, angular) {
  "use strict";

  angular.module("header")
         .component("header", {
           "templateUrl": global.templateUrl + "/header.html",
           "controller" : ["$rootScope", "$state", "$filter", "$interval",
             function ($rootScope, $state, $filter, $interval) {

               var that = this;

               this.collapsed = true;

               this.tabs = [
                            {"name"  : "dashboard.summary",
                             "text"  : "Summary",
                             "params": {"state": ""},
                             "icon"  : "fa fa-th-large"
                            },
                            {"name"  : "dashboard.trackweekly",
                             "text"  : "Track Weekly",
                             "params": {

                               "state": this.states
                             },
                             "icon"  : "fa fa-calendar"
                            },
			    {"name"  : "dashboard.trackspecial",
                             "text"  : "Track Special",
                             "params": {

                               "state": this.states
                             },
                             "icon"  : "fa fa-star-o"
                            },
			    {"name"  : "dashboard.tracksocial",
                             "text"  : "Track Social",
                             "params": {

                               "state": this.states
                             },
                             "icon"  : "fa fa-star-o"
                            },
			    {"name"  : "dashboard.reports",
                             "text"  : "Reports",
                             "params": {

                               "state": this.states
                             },
                             "icon"  : "fa fa-file-text-o"
                            }
                           ];

               this.toggleCollapse = function () {

                 this.collapsed = !this.collapsed;
               };

               this.toggleSidebar = function(){

                  $('#mySidenav').css('display', 'block');
                  $('.menubutton').css('display', 'none');
               }

               this.hideSidebar = function(){

                  $('#mySidenav').css('display', 'none');
                  $('.menubutton').css('display', 'block');
               }

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
}(window.APP = window.APP || {}, window.angular));
