const {series, parallel, src, dest, watch} = require('gulp');
const replace = require('gulp-replace');
const postcss = require('gulp-postcss');
const twig = require('gulp-twig');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const browserSync = require('browser-sync');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const webp = require('gulp-webp');

const cleanDist = () => {
    return src('dist', {allowEmpty: true})
        .pipe(clean({force: true}));
}

const cleanBuild = () => {
    return src('build', {allowEmpty: true})
        .pipe(clean({force: true}));
}

const reloadBrowserPage = (done) => {
    browserSync.reload();
    done();
}

const runServer = () => {
    browserSync({
        server: {
            baseDir: 'dist'
        },
        notify: false
    });

    watch('src/*.twig', series(buildTwigDev, reloadBrowserPage))
    watch('src/styles/**/*.scss', series(buildScssDev, reloadBrowserPage))
    watch('src/js/**/*.js', series(buildJsDev, reloadBrowserPage))
    watch('src/images/**/*.*', series(buildImagesDev, buildImagesWebpDev, reloadBrowserPage))
    watch('src/fonts/**/*.*', series(buildFontsDev, reloadBrowserPage))
}

const buildTwigDev = (done) => {
    src('src/*.twig')
        .pipe(twig())
        .pipe(replace('styles/main.scss', 'styles/main.css'))
        .pipe(dest('dist/'))
    done();
}

const buildTwigProd = (done) => {
    src('src/*.twig')
        .pipe(twig())
        .pipe(replace('js/js.js', 'js/js.min.js'))
        .pipe(replace('styles/main.scss', 'styles/main.min.css'))
        .pipe(dest('./build/'));
    done();
}

const buildScssDev = (done) => {
    src('src/styles/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(dest('dist/styles'));
    done();
};

const buildScssProd = (done) => {
    src('src/styles/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(dest('./build/styles/'))
        .pipe(postcss())
        .pipe(rename({extname: '.min.css'}))
        .pipe(dest('./build/styles/'));
    done();
}


const buildJsDev = (done) => {
    src('src/js/*.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest('dist/js'))
    done();
};

const buildJsProd = (done) => {
    src('src/js/*.js')
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(dest('./build/js'))
        .pipe(uglify())
        .pipe(rename({extname: '.min.js'}))
        .pipe(dest('./build/js'));
    done();
};

const buildImagesDev = (done) => {
    src('src/images/**/*.*')
        .pipe(dest('dist/images'))
    done();
}

const buildImagesProd = (done) => {
    src('src/images/**/*.*')
        .pipe(dest('./build/images'));
    done();
}

const buildImagesWebpDev = (done) => {
    src('src/images/**/*.{png,jpg}')
        .pipe(webp())
        .pipe(dest('./dist/images'))
    done();
}

const buildImagesWebpProd = (done) => {
    src('src/images/**/*.{png,jpg}')
        .pipe(webp())
        .pipe(dest('./build/images'))
    done();
}

const buildFontsDev = (done) => {
    src('src/fonts/**/*.*')
        .pipe(dest('dist/fonts'))
    done();
}

const buildFontsProd = (done) => {
    src('src/fonts/**/*.*')
        .pipe(dest('dist/fonts'))
    done();
}

exports.default = series(
    cleanDist,
    cleanBuild,
    parallel(
        buildTwigDev,
        buildScssDev,
        buildImagesDev,
        buildFontsDev,
        buildJsDev,
    ),
    buildImagesWebpDev,
    runServer,
);

exports.build = series(
    cleanDist,
    cleanBuild,
    buildTwigProd,
    buildScssProd,
    buildImagesProd,
    buildImagesWebpProd,
    buildFontsProd,
    buildJsProd,
);

exports.dev = exports.default;
