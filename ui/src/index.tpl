<!DOCTYPE html>
<html lang="en">

  <head>

    <meta charset="utf-8">

    <!--Fonts LATO -->
    <link rel="stylesheet" href="<%= static("fonts/lato/stylesheet.css", true) %>" />

    <!-- vendor styles -->
    <link rel="stylesheet" href="<%= static("libs/font-awesome/css/font-awesome.min.css") %>" />

    <link rel="stylesheet" href="<%= static("libs/angular-ui-bootstrap/src/position/position.css") %>"/>
    <!-- application specific styles -->
    <link rel="stylesheet" href="<%= static("css/app.css") %>"/>
  </head>
  <body>

    <div ng-app="dcube" class="app">
      <div ui-view autoscroll="false" class="content">
      </div>

      <!-- Loading overlay, which block screen unless everything is rendered -->
      <div ng-if="loading" class="loading-overlay">
        <div><span>Loading...</span></div>
      </div>
    </div>
    <script>var domainUrl = "http://traction.headrun.com:2222/"</script>
    <script>
      ;(function () {

        window.APP = window.APP || {};
		window.APP.templateUrl = "<%= templateDir %>";
      }());
    </script>

    <!-- Vendor Scripts -->
    <script src="<%= static("js/app.js") %>"></script>
  </body>
</html>
