const gulp = require('gulp');
const less = require('gulp-less');
const cleanCSS = require('gulp-clean-css');

/* ----------------------------------------- */
/*  Handle Errors function
/* ----------------------------------------- */

function handleError(err) {
	console.log(err.toString());
	this.emit('end');
}

/* ----------------------------------------- */
/*  Compile LESS
/* ----------------------------------------- */

const T2K4E_LESS = ['less/**/*.less'];

function compileLESS() {
	return gulp
		.src('./less/t2k4e.less')
		.pipe(less().on('error', handleError))
		.pipe(cleanCSS({ debug: true }, details => {
			console.log(`${details.name}: ${details.stats.originalSize}`);
			console.log(`${details.name}: ${details.stats.minifiedSize}`);
		}))
		.pipe(gulp.dest('./'))
}
const css = gulp.series(compileLESS);

/* ----------------------------------------- */
/*  Watch Updates
/* ----------------------------------------- */

function watchUpdates() {
	gulp.watch(T2K4E_LESS, css);
}

/* ----------------------------------------- */
/*  Export Tasks
/* ----------------------------------------- */

exports.default = gulp.series(
	gulp.parallel(css),
	watchUpdates
);
exports.css = css;