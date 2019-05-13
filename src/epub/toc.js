const path = require('path');
const fs = require('fs');
const klawSync = require('klaw-sync');
const _ = require('lodash');
const pingyin = require('pinyinlite');

const mdListParser = require('../utils/marked/list2JsonParser');
const {success, failure} = require('../utils/result');
const TxtNode = require('../utils/TxtNode');
const {TOC_FILE, METADATA_FOLDER} = require('../context');

/**
 * 从给定文件夹中读取目录列表。
 *
 * 首先读取 toc.md 文件，如果此文件不存在，则读取 txt 文件名作为目录。
 *
 * @param folder 文件夹
 * @return {Result} 目录列表或错误信息
 */
function loadToc(folder) {
    const tocPath = path.resolve(folder, METADATA_FOLDER, TOC_FILE);

    if (fs.existsSync(tocPath)) {
        return loadMdContentAsToc(folder, tocPath);
    }

    // 不存在 toc.md 文件，则直接读取 txt 文件名作为目录
    return loadTxtNamesAsToc(folder, true);
}

/**
 * 在 md 的树形列表中递归，并设置每个节点的 path 属性，并判断此路径是否实际存在。
 *
 * @param folder 文件夹
 * @param {Array} nodes {@link TxtNode} 节点
 * @param {Array} notExistPath 不存在的节点路径
 */
function travelTree(folder, nodes, notExistPath) {
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const {rawTitle, children} = node;
        const hasChildren = Array.isArray(children) && children.length > 0;

        node.path = path.join(folder, rawTitle);
        if (!fs.existsSync(node.path)) {
            notExistPath.push(rawTitle);
        }

        if (hasChildren) {
            travelTree(folder, children, notExistPath);
        }
    }
}

/**
 * 遍历 md toc 节点，并检测对应文件是否存在，不存在给出提示，存在则将 path 属性置入 Node
 *
 * @param folder txt 所在文件夹
 * @param mdFile toc.md 文件，markdown 列表格式
 * @return {Result} {@link TxtNode} 数组
 */
function loadMdContentAsToc(folder, mdFile) {
    const mdName = path.basename(mdFile);
    let mdContent;
    try {
        mdContent = fs.readFileSync(mdFile);
    } catch (e) {
        return failure(`[${mdName}] 文件读取出现错误：${e.message}`);
    }

    mdContent = mdContent.toString().trim();
    if (!mdContent.trim()) return failure(`[${mdName}] 文件内容尚未定义`);

    const mdTocNodes = mdListParser(mdContent);
    if (_.isEmpty(mdTocNodes)) return failure(`[${mdName}] 文件内容尚未定义`);

    // 递归遍历
    const notExistPath = [];
    travelTree(folder, mdTocNodes, notExistPath);

    if (!_.isEmpty(notExistPath)) {
        let msg = `[${mdName}] 中如下节点并不实际存在:\n`;
        notExistPath.forEach(dir => {
            msg += `    - ${dir}\n`;
        });
        return failure(msg);
    }

    return success(mdTocNodes);
}

/**
 * 文件过滤，支持 txt 扩展名。
 *
 * todo: 将来可以考虑增加 md 扩展名。
 *
 * @param item 文件路径
 * @return {boolean} 是否有效文本文件
 */
function txtFilter(item) {
    return ['.txt'].includes(path.extname(item.path).toLowerCase());
}

/**
 * 返回给定文件夹下所有 txt 文本文件名作为目录，并按照拼音排序。
 *
 * 如果文件名是 01_file_real_name.txt 格式，则会返回 file_real_name，前置的 01 用于排序。
 *
 * @param folder txt 文件夹
 * @param pinyinSort 是否按照拼音排序
 * @return {Result} txt 文件名构成的数组，条目为 {@link TxtNode}
 */
function loadTxtNamesAsToc(folder, pinyinSort = false) {
    const files = klawSync(folder, {
        nodir: true,
        filter: txtFilter,
    });

    if (_.isEmpty(files)) {
        return failure('未发现任何文本文件');
    }

    const fileArr = files.map(file => {
        // 如果标题前面有数字（格式为：123__xxx），则去掉下划线及前置数字，只保留后面内容
        const re = /^(\d*_{2})?(.+)/g;

        const filePath = file.path;
        const ext = path.extname(filePath);
        const rawTitle = path.basename(filePath).trim();
        let title = path.basename(filePath, ext).trim();
        const match = re.exec(title);
        if (match) {
            title = match[2];
        }

        return new TxtNode(title, null, null, rawTitle, ext, filePath);
    });

    if (pinyinSort) {
        fileArr.sort((f1, f2) => {
            const f1Pinyin = pingyin(f1.rawTitle).join('');
            const f2Pinyin = pingyin(f2.rawTitle).join('');
            return f1Pinyin.localeCompare(f2Pinyin);
        });
    }

    return success(fileArr);
}

module.exports = {
    loadTxtNamesAsToc,
    loadMdContentAsToc,
    loadToc,
};
