import utils from '../src/utils.js'
import LZ77 from '../src/deflate/LZ77.js'

(function testLZ77() {
    const lz77 = new LZ77()
    const lz77EncodeData = lz77.encode((new Uint8Array([
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0,
        255, 0, 255, 0, 255, 255, 255, 0, 0
    ])).buffer)

    const bufferView = new Uint8Array(lz77EncodeData)


    utils.debug('lz77 encode', lz77EncodeData)

    const lz77DecodeData = lz77.decode(lz77EncodeData)
    utils.debug('lz77 decode', lz77DecodeData)
})()