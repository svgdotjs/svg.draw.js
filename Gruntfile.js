'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= pkg.license %> */\n',
    // Task configuration.
    clean: {
      files: ['dist']
    },
    concat: {
      options: {
        banner: '<%= banner %>\n;(function () {\n',
        stripBanners: true,
        separator:'\n\n',
        footer:'\n}).call(this);'
      },
      dist: {
        src: ['src/svg.draw.js', 'src/rectable.js', 'src/lineable.js', 'src/circle.js', 'src/ellipse.js'],
        dest: 'dist/<%= fileName %>.js'
      },
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'dist/<%= fileName %>.min.js'
      },
    },
    jshint: {
      options: {
        jshintrc: true
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      src: {
        src: ['src/**/*.js']
      }
    },
    watch: {
      scripts: {
        files: ['src/*.js'],
        tasks: ['default']
      },
    },
    bumper: {
      options: {
        files: ['package.json', 'bower.json'],
        tagName: "%VERSION%"
      }
    },
  });
  
  grunt.config('fileName', grunt.config('pkg').name.slice(0, -3));

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-bumper');

  // Default task.
  grunt.registerTask('default', ['clean', 'concat', 'uglify']);

};
