import utils from '../src/utils.js'
import Freq from '../src/deflate/Freq.js'

(function testFreq() {
    const freq = new Freq()
    freq.update('a')
    freq.update('a')
    freq.update('a')
    freq.update('a')
    freq.update('a')
    freq.update('b')
    freq.update('b')
    freq.update('c')
    freq.update('c')
    freq.update('c')

    utils.debug(freq.getFreq())
})()