import utils from '../src/utils.js'
import RLE from '../src/deflate/RLE.js'

(function testRLE() {
    const rle = new RLE()

    utils.debug('testRLE', rle.encode((new Uint8Array([
        0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
        1,2,3,4,5,6,7,8,9,10,11,12,13,14,1,2,3,4,5,6,7,8,9,10,11,12,13,14
    ])).buffer))
})()