;(function (global, angular) {
  "use strict";

  var NUM_COLS   = 4,
      COL_HEIGHT = 300,
      COL_WIDTH  = 100/NUM_COLS;

  angular.module("layout")
         .component("layout", {

           "templateUrl": global.templateUrl + "/layout.html",
           "controller" : ["$scope", "$interval", function ($scope, $interval) {

             var that = this;

             this.layout = [];

             /* Modal Related Stuff */
             this.isModalVisible = false;
             this.modalData = {

               "insights": [],
               "recommendations": []
             };

             this.showModal = function (data) {

               if (data) {

                 this.modalData.insights = data.insights;
                 this.modalData.recommendations = data.recommendations;
               }

               this.isModalVisible = true;
             };

             this.hideModal = function () {

               this.isModalVisible = false;
               this.modalData.insights = [];
               this.modalData.recommendations = [];
             };
             /* end Modal Related Stuff */

             function prepareLayout (elementsOrder) {

               that.layout.splice(0);

               var row, spaceLeft = 0;

               angular.forEach(elementsOrder, function (elementId) {

                 var element = that.elements[elementId];

                 element = angular.extend(element,
                  {"width": COL_WIDTH*element.size + "%",
                   "height": element.height || COL_HEIGHT + "px"}
                 );

                 if (spaceLeft === 0) {

                   spaceLeft = NUM_COLS;
                   row = [];
                   that.layout.push(row);
                 }

                 row.push(element);
                 spaceLeft -= element.size;
               });
             }

             $scope.elementsOrder = this.elementsOrder;

             var unwatch;

             this.$onInit = function () {

               unwatch = $scope.$watch(function (scope){

                 return scope.elementsOrder;
               }, function () {

                 prepareLayout(that.elementsOrder);
               }, true);
             };

             this.$onDestroy = function () {

               return unwatch && unwatch();
             };
           }],
           "bindings": {

             "elements"     : "<",
             "elementsOrder": "<"
           }
         });
}(window.APP = window.APP || {}, window.angular));
