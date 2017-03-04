;(function (global, angular) {
  "use strict";

  angular.module("logout")
         .component("logout", {

           "templateUrl": global.templateUrl + "/logout.html",
           "controller" : ["$rootScope",
                           "Auth", "AUTH_EVENTS",
             function ($rootScope, Auth, AUTH_EVENTS) {

               this.logout = function () {

                 Auth.logout().then(function () {

                   $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
                 });
               };
             }
           ]
         });

}(window.APP = window.APP || {}, window.angular));
