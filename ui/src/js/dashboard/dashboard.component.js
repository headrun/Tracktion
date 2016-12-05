;(function (angular) {
  "use strict";

  angular.module("dashboard")
         .component("dashboard", {

           "templateUrl": "/js/dashboard/dashboard.html",
           "controller" : ["Session", "$state", "$rootScope",

             function (Session, $state, $rootScope) {

               var that = this;

               this.user = Session.get();

               this.isLoading = true;

               this.showLoading = function () {

                 this.isLoading = true;
               };

               this.hideLoading = function () {

                 this.isLoading = false;
               };

               this.tabStates = {
                                  "dashboard": {"trackweekly": "{}",
						"trackspecial": "{}",
						"tracksocial": "{}",
						"reports": "{}",                                                
                                                }
                                };

               function updateUrl (stateName) {

                 $state.go("dashboard." + stateName,
                           {"state": that.tabStates.dashboard[stateName]},
                           {"notify": false});
               }

               this.activeTab = "dashboard.summary";

               this.setActiveTab = function (tabName) {

                 this.activeTab = tabName;
               };

               this.updateState = function (stateName, value) {

                 var state = JSON.stringify(value);
                 this.tabStates.dashboard[stateName] = state;
                 updateUrl(stateName);
               };

               function onNavigation (event, next, params) {

                 that.updateState(next.name.split(".")[1],
                                  JSON.parse(params.state || "{}"));
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

               if ($state.current.name === "dashboard") {

                 $state.go("dashboard.summary");
                 return;
               }

               this.updateState($state.current.name.split(".")[1],
                                JSON.parse($state.params.state || "{}"));
             }]
         });
}(window.angular));
