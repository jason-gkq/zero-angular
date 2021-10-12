const gulp = require('gulp');
const through = require('through2');

var routings = [];
var actions = [];

gulp.task('routing', () => {
    return gulp.src('./pages/**/*-routing.module.ts')
        .pipe(through.obj(
            (file, encode, cb) => {
                const content = file.contents.toString();
                const pattern = [/data\:\s\{[^\}]+\}{1}/g, /\{[^\}]+\}{1}/g, /[\r\s]/g];
                routings = routings.concat(formatWithRegExp(content, pattern));
                cb();
            }
        ));
})


gulp.task('action', () => {
    return gulp.src('./pages/**/*.html')
        .pipe(through.obj(
            (file, encode, cb) => {
                const content = file.contents.toString();
                const pattern = [/\[lcbAuth\]\=\"\'(.+)\'\"/g, /\'(.+)\'{1}/g, /[\r\s\']/g];
                actions = actions.concat(formatWithRegExp(content, pattern));
                cb();
            }
        ));
})

function formatWithRegExp(content, regexpArr) {
    const result = [];
    const auth = content.match(regexpArr[0]) || [];
    [...auth].forEach(route => {
        const formatedAuth = route.match(regexpArr[1]);
        formatedAuth.forEach(i => {
            result.push(i.replace(regexpArr[2], ''));
        })
    })

    return result;
}

gulp.task('scan', ['routing', 'action'], () => {
    console.log(routings);
    console.log(actions);
})

gulp.task('default', ['scan']);
