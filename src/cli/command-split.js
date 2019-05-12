const path = require('path');

const {SPLIT_OUTPUT_FOLDER} = require('../context');
const {logError} = require('../utils/logUtils');
const {existFolder, FolderMode, fileName} = require('../utils/fileUtils');
const {splitTxtFile2Dest, splitAllTxt2Dest} = require('../split/splitFile');
const {logCustomHelp, boolArg} = require('./utils');

/**
 * split 命令的自定义帮助信息
 */
function customHelp() {
    logCustomHelp('s -t /path/to/txt/dir');
    logCustomHelp('split -t /path/to/txt/dir');
    logCustomHelp('split -t /path/to/txt/file.txt');
    logCustomHelp('split -t /path/to/txt/file.txt -d /path/to/dest/dir -o n');
}

function customCommand(program) {
    program
        .command('split')
        .alias('s')
        .description('按章节分隔单个 txt 文件到目标路径下')
        .option('-t, --txt <file/dir>', 'txt 文件路径，如为目录，则转换下面所有 txt 文件')
        .option('-d, --dest [dir]', '分割后文件输出的目标路径，默认为 txt 所在目录')
        .option('-o, --overwrite [Y/n]', '目标路径存在时是否覆盖', boolArg, true)
        .on('--help', function() {
            // txt2epub split -h 时显示此信息
            console.log('');
            console.log('Examples:');
            console.log('');
            customHelp();
        })
        .action(function(options) {
            const {txt, dest, overwrite} = options;

            // 未提供 txt 参数时输出错误信息和当前命令的帮助信息
            if (!txt) {
                console.log();
                logError('[-t, --txt] 参数不能为空');
                console.log();
                this.outputHelp();
                return;
            }

            let isFile = false;
            const txtMode = existFolder(txt);
            if (txtMode === FolderMode.NOT_EXIST) {
                logError(`[${txt}] 不存在`);
                return;
            }
            if (txtMode === FolderMode.NOT_FOLDER) {
                isFile = true;
            }

            let destFolder = dest;
            if (!dest) {
                if (isFile) {
                    const name = fileName(txt);
                    destFolder = path.resolve(path.dirname(txt), SPLIT_OUTPUT_FOLDER, name);
                } else {
                    destFolder = path.resolve(txt, SPLIT_OUTPUT_FOLDER);
                }
            } else {
                // 检查是否为已存在文件而非文件夹
                const mode = existFolder(dest);
                if (mode === FolderMode.NOT_FOLDER) {
                    logError(`[${dest}] 是已存在文件，而非文件夹`);
                    return;
                }
            }

            if (isFile) {
                splitTxtFile2Dest(txt, destFolder, overwrite);
            } else {
                splitAllTxt2Dest(txt, destFolder, overwrite);
            }
        });
}

module.exports = {
    customCommand,
    customHelp,
};