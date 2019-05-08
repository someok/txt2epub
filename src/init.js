const path = require('path');
const os = require('os');
const inquirer = require('inquirer');
const chalk = require('chalk');
const pkg = require('../package');
const fileUtils = require('./utils/fileUtils');
const metadata = require('./metadata');

const pkgVersion = pkg.version;
console.log(chalk.bold.cyan(`\n...Txt2Eput ${pkgVersion} metadata init...\n`));

const folderQuestion = {
    type: 'input',
    name: 'folder',
    message: '请输入 txt 所在目录（此目录必须已经存在）：',
    validate: function validate(input) {
        const isFolder = fileUtils.existFolder(input) === fileUtils.FolderMode.NORMAL;
        if (isFolder) {
            return isFolder;
        }

        return chalk.bold.red('不是有效路径，请重新输入');
    },
};

const titleQuestion = {
    type: 'input',
    name: 'title',
    message: '请输入 epub 书名：',
    default: function def(answers) {
        return path.basename(answers.folder);
    },
};

const questions = [
    folderQuestion,
    titleQuestion,
    {
        type: 'input',
        name: 'author',
        message: '请输入作者：',
        default: function def() {
            return os.userInfo().username;
        },
    },
    {
        type: 'input',
        name: 'description',
        message: '请输入简介（可以为空）：',
    },
    {
        type: 'confirm',
        name: 'confirm',
        message: '确认上述信息正确?',
        default: true,
    },
];

/**
 * 通过命令行初始化 metadata 信息。
 *
 * 也就是在给定目录下初始化 $$t2e.data 目录，以及下面的相应 yaml。
 */
inquirer.prompt(questions).then(answers => {
    console.log();
    console.log(answers);
    if (!answers.confirm) {
        console.log(chalk.bold.red('放弃初始化!'));
    } else {
        const {folder, ...meta} = answers;
        metadata.init(folder, meta);
    }

    console.log();
});
