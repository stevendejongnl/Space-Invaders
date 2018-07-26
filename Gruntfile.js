module.exports = function(grunt) {
    const mozjpeg = require('imagemin-mozjpeg');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        watch: {
            files: [
                'source/**/*.js',
                'source/**/*.scss'
            ],
            tasks: ['concat', 'uglify', 'jshint', 'sass', 'cssmin']
        },
        concat: {
            options: {
                separator: 'rn'
            },
            dist: {
                src: ['source/scripts/main.js'],
                dest: 'assets/scripts/main.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'source/scripts/main.js',
                dest: 'assets/scripts/main.min.js'
            }
        },
        jshint: {
            files: ['gruntfile.js', 'source/scripts/*.js'],
            options: {
                'esversion': 6,
                globals: {
                    jQuery: false,
                    console: true,
                    module: true
                }
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    'assets/styles/main.css': 'source/styles/main.scss'
                }
            }
        },
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'assets/styles/main.min.css': 'assets/styles/main.css'
                }
            }
        },
        imagemin: {
            dynamic: {
                options: {
                    optimizationLevel: 3,
                    svgoPlugins: [{removeViewBox: false}],
                    use: [mozjpeg()] // Example plugin usage
                },
                files: [{
                    expand: true,
                    cwd: 'source/images/',
                    src: ['**/*.{png,jpg,gif,svg}'],
                    dest: 'assets/images/'
                }]
            }
        },
        browserSync: {
            default_options: {
                bsFiles: {
                    src: [
                        '*.html',
                        'source/scripts/*.js',
                        'source/styles/*.scss'
                    ]
                },
                options: {
                    watchTask: true,
                    server: {
                        baseDir: "./"
                    }
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify-es');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browser-sync');

    // Default task(s).
    grunt.registerTask('default', ['browserSync', 'watch']);
    grunt.registerTask('image', ['imagemin']);

};