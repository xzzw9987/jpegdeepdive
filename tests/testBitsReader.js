import BitsReader from '../src/deflate/io/BitsReader.js'
import utils from '../src/utils.js'

(function testBitsReader() {
    const bitsReader = new BitsReader(
        new Uint8Array([0b00110101, 0b10011100]).buffer
    )

    utils.debug(bitsReader.read(8))
    utils.debug(bitsReader.read(8))
    utils.debug(bitsReader.read(1))
})()