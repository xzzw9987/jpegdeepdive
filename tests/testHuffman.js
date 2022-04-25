import utils from '../src/utils.js'
import CanonicalHuffman from '../src/deflate/CanonicalHuffman.js'

(function testHuffman() {
    const canonicalHuffman = new CanonicalHuffman()
    utils.debug('token table', canonicalHuffman.buildTokenTable([
        {val: 'a', frequency: 3},
        {val: 'b', frequency: 10},
        {val: 'c', frequency: 5},
        {val: 'd', frequency: 4},
        {val: 'e', frequency: 7},
        {val: 'f', frequency: 9}
    ]))
    const compressed = canonicalHuffman.encode('bcdaaaefefe')
    utils.debug('compressed', compressed)
    const decoder = canonicalHuffman.decode(compressed)
    utils.debug('decoded', decoder.next())
    utils.debug('decoded', decoder.next())
    utils.debug('decoded', decoder.next())
    utils.debug('decoded', decoder.next())
    utils.debug('decoded', decoder.next())
    utils.debug('decoded', decoder.next())
})()