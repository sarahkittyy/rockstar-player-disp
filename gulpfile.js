const gulp = require('gulp');
const ts = require('gulp-typescript');

const tsproj = ts.createProject('tsconfig.json');

gulp.task('build', () => {
	return gulp.src('src/**/*.ts')
	.pipe(tsproj())
	.pipe(gulp.dest('build'));
});