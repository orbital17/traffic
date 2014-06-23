module.exports = function(grunt) {

    // Задачи
    grunt.initConfig({
        watch: {
            js: {
                files: ['index.js']
            }
        },
        connect: {
            test: {
                options: {
                    port: 8001,
                    base: '.',
                    hostname: 'localhost'
                }
            }
        },
        browserSync: {
            dev: {
                bsFiles: {
                    src : 'js/index.js'
                },
                options: {
                    server: {
                        baseDir: "."
                    }, 
                    watchTask: true
                }
            }
        }
    });

    // Загрузка плагинов, установленных с помощью npm install
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-browser-sync');

    // Задача по умолчанию
    grunt.registerTask('default', ['browserSync','watch']);
};