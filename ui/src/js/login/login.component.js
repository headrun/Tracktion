;(function (angular) {
  "use strict";

  angular.module("login")
         .component("login", {

           "templateUrl" : "/js/login/login.html",
           "controller"  : ["$rootScope", "Auth", "AUTH_EVENTS", "$state",

             function ($rootScope, Auth, AUTH_EVENTS, $state) {

	      Auth.status();

              var self=this;

              this.credentials = {

                "username": "",
                "password": ""
              };

              self.errorMsg = "";
              self.loadingText = "Submit";

              this.onSubmit = function (credentials) {

                self.loadingText = "Verifying...";
                self.viewSubmit = "disabled";

                Auth.login(credentials).then(function () {
                    $state.go("dashboard");
                    $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                }, function () {

                    self.loadingText = "Submit";
                    self.errorMsg = "Invalid Credentials";
                    self.viewSubmit = "";
                });
              };
            }]
        });

}(window.angular));
