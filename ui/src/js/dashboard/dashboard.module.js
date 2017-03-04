;(function (angular) {
  "use strict";

  angular.module("dashboard", ["auth", "header", "trackweekly","trackspecial","tracksocial", "reports", "summary", "dropdown"])
         .config(["$anchorScrollProvider", function ($asp) {
         
           $asp.disableAutoScrolling()
         }]);

}(window.angular));
