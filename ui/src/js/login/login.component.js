;(function (angular) {
  "use strict";

  angular.module("login")
         .component("login", {

           "templateUrl" : "/js/login/login.html",
           "controller"  : ["$rootScope", "Auth", "AUTH_EVENTS",

             function ($rootScope, Auth, AUTH_EVENTS) {

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
