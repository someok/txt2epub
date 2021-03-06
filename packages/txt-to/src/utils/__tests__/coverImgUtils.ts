import PImage from 'pureimage';

import {createCoverImage, registerFont, wrapText} from '../coverImgUtils';
import Meta from '../../metadata/Meta';

test('wrapText', (done): void => {
    registerFont().load(function (): void {
        const img = PImage.make(200, 200);
        const ctx = img.getContext('2d');
        const txt = '这是一个很长的测试文本，this is long test text';
        const lines = wrapText(ctx, txt, 0, 0, 100);
        console.log(lines);
        expect(lines.length).toBe(3);
        expect(lines[0].line).toBe('这是一个很长的测');
        expect(lines[0].x).toBe(0);
        expect(lines[0].y).toBe(0);

        done();
    });
});

test.skip('initCover', (done): void => {
    const promiseArr = [];
    for (let i = 0; i < 5; i++) {
        const p = createCoverImage(
            `/Users/wjx/Desktop/demo/test${i}.jpg`,
            new Meta(
                '这是一个很长的测试文本，this is long test text',
                '测试员测试员测试员测试员测试员测试员'
            ),
            'center'
        );
        promiseArr.push(p);
    }

    Promise.all(promiseArr)
        .then((): void => {
            console.log('over');
            done();
        })
        .catch((err): void => {
            console.log(err);
            done();
        });
});
