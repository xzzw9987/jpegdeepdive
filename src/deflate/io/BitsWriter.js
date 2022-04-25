import utils from '../../utils.js'

export default class BitsWriter {
    data = []
    bitsOffset = 0

    write(bitsStr) {
        for (let i = 0; i < bitsStr.length; i++) {
            const bytesOffset = this.bitsOffset >> 3
            const restBits = this.bitsOffset % 8
            if (this.data[bytesOffset] === void 0) this.data[bytesOffset] = 0
            this.data[bytesOffset] += (bitsStr[i] === '0' ? 0 : 1) << (7 - restBits)
            this.bitsOffset++
        }
    }

    getArrayBuffer() {
        return utils.arrayBufferFromArray(this.data)
    }
}