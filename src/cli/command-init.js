const {logCustomHelp} = require('./utils');
const metadataInit = require('../metadata/init');

/**
 * init 命令的自定义帮助信息
 */
function customHelp() {
    logCustomHelp('i');
    logCustomHelp('init');
    logCustomHelp('init /path/to/txt/dir');
}

function customCommand(program) {
    program
        .command('init [dir]')
        .alias('i')
        .description('交互式命令，初始化 yaml 格式的 metadata 文件, [dir] 未提供时采用当前目录')
        .on('--help', function() {
            // txt2epub init -h 时显示此信息
            console.log('');
            console.log('Examples:');
            console.log('');
            customHelp();
        })
        .action(function(dir) {
            metadataInit(dir || process.cwd());
        });
}

module.exports = {
    customCommand,
    customHelp,
};
