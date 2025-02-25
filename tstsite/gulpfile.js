//paths for source and bundled parts of app
var basePaths = {
    src: 'src/',
    dest: 'assets/',
    bower: 'bower_components/'
};

//require plugins
var gulp = require('gulp');

var es = require('event-stream'),
    gutil = require('gulp-util'),
    mainBowerFiles = require('main-bower-files'),
    bourbon = require('node-bourbon'),
    path = require('relative-path'),
    runSequence = require('run-sequence'),
    penthouse = require('penthouse'),
    cleanCSS = require('clean-css'),
    fs = require('fs');

//plugins - load gulp-* plugins without direct calls
var plugins = require("gulp-load-plugins")({
    pattern: ['gulp-*', 'gulp.*'],
    replaceString: /\bgulp[\-.]/
});

//env - call gulp --prod to go into production mode
var sassStyle = 'expanded'; // SASS syntax
var sourceMap = true; //wheter to build source maps
var isProduction = false; //mode flag

if(gutil.env.prod === true) {
    isProduction = true;
    sassStyle = 'compressed';
    sourceMap = false;
}

//log
var changeEvent = function(evt) {
    gutil.log('File', gutil.colors.cyan(evt.path.replace(new RegExp('/.*(?=/' + basePaths.src + ')/'), '')), 'was', gutil.colors.magenta(evt.type));
};


//js
gulp.task('build-js', function() {
    var vendorFiles = mainBowerFiles({ //files from bower_components
            paths: {
                bowerDirectory: basePaths.bower,
                bowerJson: 'bower.json'
            }
        }),        
        appFiles = [basePaths.bower+'imagesloaded/imagesloaded.pkgd.min.js',
                    basePaths.bower+'masonry/dist/masonry.pkgd.min.js',                    
                    basePaths.bower+'readmore/readmore.min.js',
                    basePaths.bower+'swipebox/src/js/jquery.swipebox.min.js',
                    basePaths.src+'js/*']; //our own JS files

    return gulp.src(vendorFiles.concat(appFiles)) //join them
        .pipe(plugins.filter('*.js'))//select only .js ones
        .pipe(plugins.concat('bundle.js'))//combine them into bundle.js
        .pipe(isProduction ? plugins.uglify() : gutil.noop()) //minification
        .pipe(plugins.size()) //print size for log
        .on('error', console.log) //log
        .pipe(gulp.dest(basePaths.dest+'js')) //write results into file
});


//sass
gulp.task('build-css', function() {

    //paths bourbon
    var paths = require('node-bourbon').includePaths;

    var vendorCSSFiles = mainBowerFiles({ //files from bower_components
        paths: {
            bowerDirectory: basePaths.bower,
            bowerJson: 'bower.json'
        }
    }),        
    appCSSFiles = [basePaths.bower+'swipebox/src/css/swipebox.min.css'];
    
    var vendorFiles = gulp.src(basePaths.bower+'swipebox/src/css/swipebox.min.css'), //components bower_components/chosen/chosen.min.css
        appFiles = gulp.src(basePaths.src+'sass/main.scss') //our main file with @import-s
            .pipe(!isProduction ? plugins.sourcemaps.init() : gutil.noop())  //process the original sources for sourcemap
            .pipe(plugins.sass({
                outputStyle: sassStyle, //SASS syntas
                includePaths: paths //add bourbon + mdl
            }).on('error', plugins.sass.logError))//sass own error log
            .pipe(plugins.autoprefixer({ //autoprefixer
                browsers: ['last 4 versions'],
                cascade: false
            }))
            .pipe(!isProduction ? plugins.sourcemaps.write() : gutil.noop()) //add the map to modified source
            .on('error', console.log); //log

    return es.concat(appFiles, vendorFiles) //combine vendor CSS files and our files after-SASS        
        .pipe(plugins.concat('bundle.css')) //combine into file
        .pipe(isProduction ? plugins.cssmin() : gutil.noop()) //minification on production
        .pipe(plugins.size()) //display size        
        .pipe(gulp.dest(basePaths.dest+'css'))  // write rev'd assets to build dir          
        .on('error', console.log); //log    
    
});

//revision
gulp.task('revision-clean', function(){
    
    return gulp.src(basePaths.dest+'rev/*', {read: false})
            .pipe(plugins.clean())
            .on('error', console.log); //log   
});

gulp.task('revision', function(){    
    
    return gulp.src([basePaths.dest+'css/*.css', basePaths.dest+'js/*.js'])
        .pipe(plugins.rev())
        .pipe(gulp.dest( basePaths.dest+'rev' ))
        .pipe(plugins.rev.manifest())        
        .pipe(gulp.dest(basePaths.dest+'rev')) // write manifest to build dir        
        .on('error', console.log); //log   
});



// copy bootstrap for local fallback 
gulp.task('copy-b-css', function(){
});

gulp.task('copy-b-js', function(){
    
    var vendor = [];
    
    return gulp.src(vendor)
        .pipe(plugins.concat('vendor.js'))//combine them into vendor.js        
        .pipe(plugins.size()) //print size for log
        .on('error', console.log) //log
        .pipe(gulp.dest(basePaths.dest+'js'));
});

gulp.task('copy-b-fonts', function(){

    return gulp.src('bower_components/bootstrap/dist/fonts/*')
        .pipe(gulp.dest(basePaths.dest+'fonts/bootstrap'));
});

gulp.task('copy-files', function(callback) {
    runSequence('copy-b-css',
        'copy-b-fonts',
        'copy-b-js',        
        callback);
});


//type of builds
gulp.task('init-build', function(callback) {
    runSequence('copy-files',
        'build-css',
        'build-js',
        'revision-clean',
        'revision',
        callback);
});

gulp.task('full-build', function(callback) {
    runSequence('build-css',
        'build-js',
        'revision-clean',
        'revision',
        callback);
});

gulp.task('full-build-css', function(callback) {
    runSequence('build-css',        
        'revision-clean',
        'revision',
        callback);
});

gulp.task('full-build-js', function(callback) {
    runSequence('build-js',
        'revision-clean',
        'revision',
        callback);
});


//watchers
gulp.task('watch', function(){
    gulp.watch(basePaths.src+'sass/*.scss', ['full-build-css']).on('change', function(evt) {
        changeEvent(evt);
    });
    gulp.watch(basePaths.src+'js/*.js', ['full-build-js']).on('change', function(evt) {
        changeEvent(evt);
    });
});


//default
gulp.task('default', ['init-build', 'watch']);
