import utils from '../utils.js'
import BitsReader from './io/BitsReader.js'
import BitsWriter from './io/BitsWriter.js'

export default class LZ77 {
    distanceBits = 0
    windowSize = 0

    constructor(windowSize = 1024) {
        this.distanceBits = Math.ceil(Math.log2(windowSize))
        this.windowSize = windowSize
    }

    encode(ab) {
        // group of triplet (char<length: 9bits>, distance<length: this.distanceBits bits>, length<length: this.distanceBits bits>)
        // if char == 257, indicates end of stream
        // if char == 256, next segment is a distance block + length block
        // else if char < 256 then char is a literal byte
        const bufferView = new Uint8Array(ab)
        const bitsWriter = new BitsWriter()
        let slideWindow = []
        let i = 0
        // @todo Replace with Rabin-Karp
        while (i < bufferView.length) {
            // utils.debug('i', i)
            let j = Math.min(
                i + Math.max(slideWindow.length - 1, 0),
                i + Math.max(this.windowSize - 1, 0),
                bufferView.length - 1
            )
            let distance = 0
            let length = 0
            let subBufferView = bufferView.slice(i, i + 1)
            let earlyBreak = false
            while (j > i) {
                subBufferView = bufferView.slice(i, j + 1)
                for (let k = slideWindow.length - 1; k > -1; k--) {
                    const subSlideWindow = slideWindow.slice(k, k + j - i + 1)
                    if (utils.isSameArray(subSlideWindow, subBufferView)) {
                        distance = slideWindow.length - k
                        length = j - i + 1
                        earlyBreak = true
                        break
                    }
                }
                if (earlyBreak) break
                j--
            }
            if (distance === 0) {
                bitsWriter.write(utils.padStartWithZero(bufferView[i], 9))
            } else {
                bitsWriter.write(utils.padStartWithZero(256, 9))
                bitsWriter.write(utils.padStartWithZero(distance, this.distanceBits))
                bitsWriter.write(utils.padStartWithZero(length, this.distanceBits))
            }
            subBufferView = bufferView.slice(i, j + 1)
            // make sure slideWindow will not overflow
            if (slideWindow.length === this.windowSize) {
                slideWindow.splice(0, subBufferView.length)
            }
            slideWindow.push(...subBufferView)
            i = j + 1
        }
        bitsWriter.write(utils.padStartWithZero(257, 9))
        return bitsWriter.getArrayBuffer()
    }

    decode(ab) {
        const ret = []
        const bitsReader = new BitsReader(ab)
        const slideWindow = []
        while (true) {
            const num = parseInt(bitsReader.read(9), 2)
            if (num === 257) return utils.arrayBufferFromArray(ret)
            let subBufferView = []
            if (num === 256) {
                const distance = bitsReader.read(this.distanceBits)
                const length = bitsReader.read(this.distanceBits)
                const distanceInt = parseInt(distance, 2)
                const lengthInt = parseInt(length, 2)
                subBufferView = slideWindow.slice(slideWindow.length - distanceInt, slideWindow.length - distanceInt + lengthInt)
            } else {
                subBufferView = [num]
            }
            ret.push(...subBufferView)
            // make sure slideWindow will not overflow
            if (slideWindow.length === this.windowSize) {
                slideWindow.splice(0, subBufferView.length)
            }
            slideWindow.push(...subBufferView)
        }
    }
}