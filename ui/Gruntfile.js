var fs     = require("fs"),
    uglify = require("uglify-js"),
    grunt  = require("grunt"),
    _      = require("underscore"),
    htmlMinify = require('html-minifier').minify,
    jsdom = require("jsdom").jsdom,
    serializeDocument = require("jsdom").serializeDocument;


var pkg = JSON.parse(fs.readFileSync("package.json")),
    isProd = pkg.environment === "production";

var uglifyJSOps = {

  "banner": "/*! <%= pkg.name %> - v<%= pkg.version %> - " +
            "<%= grunt.template.today(\"yyyy-mm-dd\") %> */"
};

if (isProd) {

  _.extend(uglifyJSOps, {

    "stripBanners": true,
    "separator": ";",
    "process": function (src) {

      return uglify.minify(src, {

        "fromString": true,
        "compress": {

          "dead_code"    : true,
          "drop_console" : true,
          "drop_debugger": true,
          "unused"       : true,
          "join_vars"    : true
        },
        "mangle": {

          "toplevel": true
        }
      }).code;
    }
  });
} else {

  _.extend(uglifyJSOps, {

    "separator": "\n/*===================================*/\n",
    "process": function (src, filePath) {

      return "/* FILE: " + filePath + " */\n\n" + src;
    }
  });
}

function getLessCssOpts () {

  return {

    "plugins": [

      new (require('less-plugin-autoprefix'))({}),
      new (require('less-plugin-clean-css'))({})
    ],
    "compress": true
  };
}

function getHtmlOptions (staticUrl, templateParams, doNotParse) {

  var version = pkg.version;

  templateParams = templateParams || {};

  return {

    "process": function (template) {

      template = _.template(template)(_.extend({}, templateParams, {

        "title": null,
        "static": function (url, noVersioning) {

          return staticUrl + "/" + url +
                 (!noVersioning ? "?v=" + version : "");
        }
      }));

      if (!doNotParse) {

	/* parse script tags with type template and put actual
	 * content in 'em */
	var doc = jsdom(template, {}),
	    window = doc.defaultView,
	    document = window.document,
	    scripts = document.querySelectorAll('[type="template"]');

	_.each(scripts, function (el) {

	  var src = el.src;

	  src = fs.readFileSync(src);

	  el.innerHTML = src;
	  el.removeAttribute("src");
	});

        template = serializeDocument(doc);
      }

      return htmlMinify(template,
                        {
                          "processScripts": ["template"],
                          "removeComments": true,
                          "collapseWhitespace": true,
                          "sortAttributes": true,
                          "sortClassName": true
                        });
    }
  };
}

var config = {

  "pkg"        : pkg,
  "dist"       : "dist",
  "src"        : "src",
  "libsPath"   : "<%= src %>/libs",
  "vendorPath" : "<%= src %>/vendor",
  "wallJsPath" : "<%= src %>/wall/js",
  "jsPath"     : "<%= src %>/js",
  "concat": {

    "adminJs": {

      "options": uglifyJSOps,
      "src": ["<%= libsPath %>/jquery/dist/jquery.js",
              "<%= vendorPath %>/wordcloud/tagcloud.js",
              "<%= vendorPath %>/raphael/raphael2.0.js",
              "<%= vendorPath %>/usmap/usmap.js",
              "<%= libsPath %>/highcharts/highcharts.js",
              "<%= libsPath %>/highcharts/highcharts-more.js",
              "<%= libsPath %>/angular/angular.min.js",
              "<%= libsPath %>/angular-ui-router/release/angular-ui-router.min.js",
              "<%= libsPath %>/angular-resource/angular-resource.min.js",
              "<%= libsPath %>/underscore/underscore.js",
              "<%= libsPath %>/angular-ui-bootstrap/src/position/position.js",
              "<%= libsPath %>/angular-ui-bootstrap/src/dropdown/dropdown.js",
              "<%= libsPath %>/justgage-toorshia/justgage.js",
              "<%= vendorPath %>/angular-cookies.min.js",
              "<%= vendorPath %>/justgage.module.js",
              "<%= jsPath %>/core/auth/auth.js",
              "<%= jsPath %>/core/auth/session.js",
              "<%= jsPath %>/core/auth/authEvents.js",
              "<%= jsPath %>/core/utils/utils.js",
              "<%= jsPath %>/highcharts/highcharts.module.js",
              "<%= jsPath %>/highcharts/highcharts.component.js",
              "<%= jsPath %>/login/login.module.js",
              "<%= jsPath %>/login/login.component.js",
              "<%= jsPath %>/logout/logout.module.js",
              "<%= jsPath %>/logout/logout.component.js",
              "<%= jsPath %>/header/header.module.js",
              "<%= jsPath %>/header/header.component.js",
              "<%= jsPath %>/filter/filter.module.js",
              "<%= jsPath %>/filter/filter.component.js",
              "<%= jsPath %>/filterBar/filterBar.module.js",
              "<%= jsPath %>/filterBar/filterBar.component.js",
              "<%= jsPath %>/layout/layout.module.js",
              "<%= jsPath %>/layout/layout.component.js",
              "<%= jsPath %>/tab/tab.module.js",
              "<%= jsPath %>/tab/tab.component.js",
              "<%= jsPath %>/trackweekly/trackweekly.module.js",
              "<%= jsPath %>/trackweekly/trackweekly.component.js",
              "<%= jsPath %>/trackspecial/trackspecial.module.js",
              "<%= jsPath %>/trackspecial/trackspecial.component.js",
              "<%= jsPath %>/tracksocial/tracksocial.module.js",
              "<%= jsPath %>/tracksocial/tracksocial.component.js",
              "<%= jsPath %>/reports/reports.module.js",
              "<%= jsPath %>/reports/reports.component.js",
              "<%= jsPath %>/dropdown/dropdown.module.js",
              "<%= jsPath %>/dropdown/dropdown.component.js",
              "<%= jsPath %>/summary/summary.module.js",
              "<%= jsPath %>/summary/summary.component.js",
              "<%= jsPath %>/dashboard/dashboard.module.js",
              "<%= jsPath %>/dashboard/dashboard.component.js",
              "<%= jsPath %>/app.js",
              "<%= jsPath %>/app.config.js"],
      "dest": "<%= dist %>/js/app.js"
    },
    "html": {

	  "options": getHtmlOptions("",
                                {templateDir: "/views"}),
      "src": ["<%= src %>/index.tpl"],
      "dest": "<%= dist %>/index.html"
    },
    "htmlTmpl": {

      "options": getHtmlOptions("", null, true),
      "files": [{
        "expand": true,
        "flatten": true,
        "src"   : "<%= src %>/js/**/*.html",
        "dest"  : "<%= dist %>/views/"
      }]
    }
  },
  "less": {

    "adminLess": {

      "options": getLessCssOpts(),
      "src": ["<%= src %>/less/app.less"],
      "dest": "<%= dist %>/css/app.css"
    }
  },
  "copy": {

    "assets": {

      "files": [
        {
          expand: true,
          cwd: "<%= src %>/",
          src: ["fonts/**"],
          dest: "<%= dist %>/"
        },
        {
          expand: true,
          cwd: "<%= src %>/",
          src: ["libs/**/*.{js,css,png,jpg,svg,jpeg,ttf,otf,woff,woff2}", "img/**"],
          dest: "<%= dist %>/"
        }
      ]
    },
  }
};

grunt.initConfig(config);

grunt.loadNpmTasks("grunt-contrib-concat");
grunt.loadNpmTasks("grunt-contrib-less");
grunt.loadNpmTasks("grunt-contrib-copy");

grunt.registerTask("default", ["concat", "less"]);
grunt.registerTask("init", ["copy", "default"]);
