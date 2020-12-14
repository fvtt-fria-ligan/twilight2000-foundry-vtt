const gulp = require('gulp');
const less = require('gulp-less');

const SYSTEM_LESS = 'less/**/*.less';

// Small error handler helper function
function handleError(err) {
	console.log(err.toString());
	this.emit('end');
}

function compileLess() {
	const options = {};
	return gulp
		.src(SYSTEM_LESS)
		.pipe(less(options).on('error', handleError))
		.pipe(gulp.dest('./styles'));
}

const css = gulp.series(compileLess);

function watchUpdates() {
	gulp.watch(SYSTEM_LESS, css)
}

exports.default = gulp.series(
	compileLess,
	watchUpdates
);
exports.css = css;