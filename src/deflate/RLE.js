import utils from '../utils.js'
import BitsReader from './io/BitsReader.js'
import BitsWriter from './io/BitsWriter.js'
const max = 127
export default class RLE {
    encode(ab) {
        // same starts with 0
        // diff starts with 1
        const bufferView = new Uint8Array(ab)
        const bitsWriter = new BitsWriter()
        let diff = [bufferView[0]]
        let sameCount = 0

        for (let i = 1; i < bufferView.length; i++) {
            if (bufferView[i] === bufferView[i - 1]) {
                sameCount = (sameCount + 1) % max
                const mSameCount = sameCount + 1
                if (
                    mSameCount === max ||
                    bufferView[i + 1] !== bufferView[i]
                ) {
                    // length
                    bitsWriter.write(utils.padStartWithZero(mSameCount, 8))
                    // number
                    bitsWriter.write(utils.padStartWithZero(bufferView[i], 8))
                }
                if (
                    bufferView[i + 1] !== bufferView[i]
                ) {
                    diff = []
                    sameCount = -1
                }
            } else {
                diff.push(bufferView[i])
                if (
                    diff.length === max ||
                    bufferView[i + 1] === void 0 ||
                    bufferView[i + 1] === bufferView[i]
                ) {
                    // length
                    bitsWriter.write(utils.padStartWithZero(128 | diff.length, 8))
                    // number
                    while (diff.length) {
                        bitsWriter.write(utils.padStartWithZero(diff.shift(), 8))
                    }
                }

                if (
                    bufferView[i + 1] === bufferView[i]
                ) {
                    diff = []
                    sameCount = -1
                }
            }
        }

        return bitsWriter.getArrayBuffer()
    }
}