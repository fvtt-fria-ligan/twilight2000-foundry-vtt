const gulp = require('gulp');
const less = require('gulp-less');

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
	const options = {};
	return gulp
		.src(T2K4E_LESS)
		.pipe(less(options).on('error', handleError))
		.pipe(gulp.dest('./styles'))
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