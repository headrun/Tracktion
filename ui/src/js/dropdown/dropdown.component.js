;(function (angular) {
  "use strict";

  angular.module("dropdown")
         .component("dropdown", {
           "templateUrl": "/js/dropdown/dropdown.html",
           "controller" : function () {

             this.isOpen = false;

             this.$onInit = function () {

               this.size = this.size || "small";
             };

             this.toggle = function (event) {

               event.preventDefault();
               this.isOpen = !this.isOpen;
             };
           },
           "bindings": {

             "size": "<",
           }
         });
}(window.angular));
