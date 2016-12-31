module.exports = function(grunt) {
  'use strict';
  
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jsdoc: {
      dist: {
        src: ['*.js'],
        options: {
          destination: 'jsdoc',
          template: "node_modules/ink-docstrap/template",
          configure: "node_modules/ink-docstrap/template/jsdoc.conf.json"
        }
      }
    },
    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },// lint your project's client code
    jshint: {
      all: ['*.js'],
      options: {
        reporter: require('jshint-stylish')
      }
    },
    uglify: {
      options: {
        mangle: true
      },
      my_target: {
        files: {
          'dist/logchief.min.js': ['logchief.js'],
          'dist/logchief.full.min.js': ['logchief.js', 'logchief-angular.js']
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-bower');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-angular-templates');

  // Default task(s).
  grunt.registerTask('default', ['jsdoc', 'uglify']);
  grunt.registerTask('test', ['karma']);
  grunt.registerTask('lint', ['jshint']);
  grunt.registerTask('bower', ['bower']);
};
