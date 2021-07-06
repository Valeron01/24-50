//переменные папок с готовым проектом и исходным кодом
let project_folder = "main";
console.log(project_folder);
let source_folder = "#src";

//Перменная файловой системы для работы функции fonts_style()
let fs = require('fs');
const { normalize } = require('path');

//Подключение плагинов
let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass')(require('sass')),
    prefixer = require('gulp-autoprefixer'),
    group_queries = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    rename_css = require('gulp-rename'),
    uglify_es = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    //webp = require('gulp-webp'),
    //webp_html = require('gulp-webp-html'),
    //webp_css = require('gulp-webpcss'),
    //svg_sprite = require('gulp-svg-sprite'),
    ttf2woof = require("gulp-ttf2woff"),
    ttf2woof2 = require("gulp-ttf2woff2"), 
    fonter = require('gulp-fonter');
    
//============================================================

//Переменная путей
let path = {
    build: {
        html: '../' + project_folder + '/templates/',
        css: '../' + project_folder + '/static/css/',
        js: '../' + project_folder + '/static/js/',
        img: '../' + project_folder + '/static/img/',
        fonts: '../' + project_folder + '/static/fonts/'
    },
    src: {
        html: [source_folder + '/*.html', '!'+source_folder+'/_*.html'],
        css: source_folder + '/scss/style.scss',
        js: source_folder + '/js/script.js',
        img: source_folder + '/img/**/*.+(png|jpg|gif|ico|svg|webp)',
        fonts: source_folder + '/fonts/**/*.ttf'
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + '/scss/**/*.scss',
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.+(png|jpg|gif|ico|svg|webp)'
        
    },
    clean: {
        static: '../' + project_folder + '/static/',
        template: '../' + project_folder + '/templates/'
    }
};
//============================================================

//Функция обработки html файлов
function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        // .pipe(webp_html())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}
//============================================================

//Функция обработки css файлов 
function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded'
            })
        )
        .pipe(prefixer({
            overrideBrowserslist: ['last 5 versions'],
            cascade: true
        }))
        .pipe(group_queries())
        // .pipe(webp_css({
        //     webpClass: '.webp',
        //     noWebpClass: '.no-webp'
        // }))
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename_css({
                extname: '.min.css'
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}
//============================================================

//Функция обработки js файлов
function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify_es())
        .pipe(
            rename_css({
                extname: '.min.js'
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}
//============================================================

//Функция обработки файлов изображений
function images() {
    return src(path.src.img)
        // .pipe(
        //     webp({
        //         quality: 70,
        //     })
        // )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            interlaced: true,
            optimizationLevel: 3 // 0 to 7
        }))
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
}
//============================================================

//Задача обработки SVG картинок
//Use 'gulp svg_sprite' in other terminal
// gulp.task('svg_sprite', () => {
//     return gulp.src([source_folder+'/iconsprite/*.svg'])
//     .pipe(svg_sprite({
//         mode: {
//             stack: {
//                 sprite: '../icons/icons.svg',
//                 //example: true
//             }
//         }
//     })
//     )
//     .pipe(dest([path.build.img]));
// });
//Задача конвертации OTF в TTF шрифты 
//Use 'gulp otf2ttf' in other terminal
gulp.task('otf2ttf', () => src([source_folder+'/fonts/*.otf'])
                            .pipe(fonter({
                                formats: ['ttf']
                            }))
                            .pipe(dest([source_folder+'/fonts/']))
);
//Функция конвертации шрифтов из TTF в WOOF
function fonts() {
    src([path.src.fonts])
    .pipe(ttf2woof())
    .pipe(dest([path.build.fonts]));
    return src([path.src.fonts])
        .pipe(ttf2woof2())
        .pipe(dest([path.build.fonts]));
}
//============================================================

//Функция автоматического прописывания шрифтов
function fonts_style() {
    let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
    if (file_content == '') {
        fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split('.');
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
                    }
                    c_fontname = fontname;
                }
            }
        })
    }
}
function cb() {}
//============================================================

//Функция очистки итоговой папки
function clean_static() {
    return del(path.clean.static, {force: true});
}
function clean_template() {
    return del(path.clean.template, {force: true});
}

//============================================================

//Функция слежки за измениями в файлах
function watchFiles() {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
}
//============================================================

//Функция настройки плагина Browser-sync
function browserSync() {
    browsersync.init({
        server: {
            baseDir: '../' + project_folder + '/templates'
        },
        port: 3000,
        notify: false
    })
}
//============================================================

//Функция определения возможности использования WebP
// function testWebP(callback) {
//     var webP = new Image();
//     webP.onload = webP.onerror = function () {
//         callback(webP.height == 2);
//     };
//         webP.src = "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
//     }
    
//     testWebP(function (support) {
    
//     if (support == true) {
//         document.querySelector('body').classList.add('webp');
//     } else {
//         document.querySelector('body').classList.add('no-webp');
//     }
// });
//============================================================

// переменные задач
let build = gulp.series(clean_static, clean_template, gulp.parallel(js, css, html, images, fonts), fonts_style);
let watch = gulp.parallel(build, watchFiles, browserSync, fonts_style);
//============================================================

//Экспорты
exports.fonts_style = fonts_style;
exports.images = images;
exports.fonts = fonts;
exports.html = html;
exports.css = css;
exports.js = js;
exports.build = build;
exports.watch = watch;
exports.default = watch;
//============================================================
