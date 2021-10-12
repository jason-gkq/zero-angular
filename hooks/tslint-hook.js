#!/usr/bin/node

const childProcess = require('child_process');
const path = require('path');

// 通过diff指令获得所有改动过（不包括删除）的js文件路径
const cmdStr = 'git diff-index --cached HEAD --name-only --diff-filter=ACMR -- *.ts';
const files = childProcess.execSync(cmdStr).toString().replace(/[\r|\n]/g, ' ');
// 如果没有改动过的文件，以0退出
if (!files) {
    process.exit(0);
}

// windows下cmd长度不能超过8000
// 因此将files切分成小于7900的字符串数组
const MAX_FILE_LENGTH = 7900;
const fileChunks = [];
let tmp = files;
while (tmp.length > MAX_FILE_LENGTH) {
    let spliceIndex = MAX_FILE_LENGTH;
    while (spliceIndex >= 0) {
        if (tmp[spliceIndex] === ' ') {
            break;
        }
        spliceIndex--;
    }
    if (spliceIndex === 0) {
        console.log('eslint error: file name too long');
        process.exit(1);
    }
    fileChunks.push(tmp.slice(0, spliceIndex));
    tmp = tmp.slice(spliceIndex + 1);
}
fileChunks.push(tmp);

const promises = fileChunks.map((fileChunk) => {
    return new Promise((resolve, reject) => {
        // 找到项目中的node_modules下的eslint二进制文件
        // 对改动过的文件路径执行tslint检查
        const cmd = `${path.normalize('./node_modules/.bin/tslint')} -c tslint.json ${fileChunk}`;
        childProcess.exec(cmd, {maxBuffer: 100 * 1024 * 1024}, (err, stdio, stderr) => {
            if (err) {
                // 打印错误
                console.log('eslint error:');
                console.log(stdio || err);

                reject(stdio || err);
            }
            resolve();
        });
    });
});

Promise.all(promises).then(() => {
    // 如果没有错误，以0退出
    process.exit(0);
}, (error) => {
    // 有错误， 以1退出
    process.exit(1);
});