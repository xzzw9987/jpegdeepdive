import Serializer from '../src/deflate/Serializer.js'
import utils from '../src/utils.js'

(function testSerializer() {
    const serializer = new Serializer();
    serializer.putBlock((new Uint8Array([1, 2, 3, 4, 5, 255, 254, 253, 100, 101])))
    utils.debug(serializer.getBlock())

    serializer.putBlock((new Uint8Array([5, 6, 7, 8, 9])))
    serializer.putBlock((new Uint8Array([99, 98, 97, 96, 88, 87, 81, 25, 16])))
    utils.debug(serializer.getBlock())
    utils.debug(serializer.getBlock())
    utils.debug(serializer.getBlock())
})()
