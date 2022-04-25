import BitsWriter from '../src/deflate/io/BitsWriter.js'
import utils from '../src/utils.js'

(function testBitsWriter() {
    const bitsWriter = new BitsWriter()
    bitsWriter.write('00110101')
    bitsWriter.write('100')
    utils.debug(bitsWriter.getArrayBuffer())
})()