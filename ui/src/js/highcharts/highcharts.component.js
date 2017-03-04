;(function (global, angular) {
  "use strict";

  angular.module("highcharts")
         .component("highcharts", {

           "templateUrl": global.templateUrl + "/highcharts.html",
           "controller" : ["Highcharts", "$element", "$scope", "$q",

           function (Highcharts, $element, $scope, $q) {

             $scope.options = this.options;

             var highchartsEle, $ele = $element.children()[0];

             var unWatch;

             var rendered = $q.defer();

             this.onRender = function () {

               rendered.resolve();
             };

             this.$onInit = function () {

               unWatch = $scope.$watch(function(scope) {

                 return scope.options.series;
               },
               function(newVal) {

                 if (highchartsEle) {

                   highchartsEle.destroy();
                 }

                 rendered.promise.then(function () {

                   highchartsEle = Highcharts.render($ele,
                                                     $scope.options);
                 });
               });
             };

             this.$onDestroy = function () {

               rendered.reject();
               return unWatch && unWatch();
             }
           }],
           "bindings": {

             "options": "<"
           }
         })
}(window.APP = window.APP || {}, window.angular));
