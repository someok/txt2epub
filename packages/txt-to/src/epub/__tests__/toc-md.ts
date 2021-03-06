import path from 'path';

import {loadMdContentAsToc} from '../toc';

test('load simple md toc', (): void => {
    const folder = path.resolve(__dirname, 'md-files', 'demo1');
    const toc = path.resolve(folder, 'toc.md');
    const {data} = loadMdContentAsToc(folder, toc);
    // console.log(result);

    expect(data.length).toBe(3);
    expect(data[0]).toEqual(
        expect.objectContaining({
            title: '1',
            rawTitle: '1.txt',
            ext: '.txt',
            path: path.resolve(folder, '1.txt'),
        })
    );
    expect(data[2]).toEqual(
        expect.objectContaining({
            title: '3',
            rawTitle: '3.txt',
            ext: '.txt',
            path: path.resolve(folder, '3.txt'),
        })
    );
});

test('load level md toc', (): void => {
    const folder = path.resolve(__dirname, 'md-files', 'demo2');
    const toc = path.resolve(folder, 'toc.md');
    const result = loadMdContentAsToc(folder, toc);
    // console.log(result);
    expect(result.success).toBeTruthy();

    const {data} = result;
    expect(data.length).toBe(2);
    // console.log(data[0]);
    expect(data[0]).toEqual(
        expect.objectContaining({
            title: 'f1',
            rawTitle: 'f1',
            ext: '',
            path: undefined,
        })
    );
    expect(data[1].children[1]).toEqual(
        expect.objectContaining({
            title: '2',
            rawTitle: 'f2/2.txt',
            ext: '.txt',
            path: path.resolve(folder, 'f2/2.txt'),
        })
    );
});

test('load level not exist md toc', (): void => {
    const folder = path.resolve(__dirname, 'md-files', 'demo2');
    const toc = path.resolve(folder, 'toc-not-exist.md');
    const result = loadMdContentAsToc(folder, toc);
    // console.log(result);
    expect(result.success).toBeFalsy();
    expect(result.message).toContain('f2/not-exist.txt');
    expect(result.message).toContain('f3/not-exist.txt');
    expect(result.message).toEqual(expect.not.stringMatching(/f3[^\/]/));
});
