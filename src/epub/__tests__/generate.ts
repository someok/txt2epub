import path from 'path';
import fse from 'fs-extra';

import {createTempFolder, existDir, existFile} from '../../utils/fileUtils';
import {copyBoilerplate} from '../generate';

test('copyBoilerplate', () => {
    const tmpDir = createTempFolder();
    // console.log(tmpDir);
    copyBoilerplate(tmpDir);

    expect(existDir(path.join(tmpDir, 'META-INF'))).toBeTruthy();
    expect(existFile(path.join(tmpDir, 'META-INF/container.xml'))).toBeTruthy();
    expect(existDir(path.join(tmpDir, 'OPS'))).toBeTruthy();
    expect(existDir(path.join(tmpDir, 'OPS/book'))).toBeTruthy();
    expect(existFile(path.join(tmpDir, 'OPS/book/.keep'))).toBeFalsy();

    // 删除临时文件
    fse.removeSync(tmpDir);
});
