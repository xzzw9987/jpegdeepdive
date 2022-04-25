export default class BitsReader {
    bufferView = null
    bitsOffset = 0

    constructor(ab) {
        this.bufferView = new Uint8Array(ab)
    }

    read(n) {
        let str = ''
        while (n > 0 && this.bitsOffset < this.bufferView.length << 3) {
            const bytesOffset = this.bitsOffset >> 3
            const restBits = this.bitsOffset % 8
            str += this.bufferView[bytesOffset] >> (7 - restBits) & 1
            this.bitsOffset++
            n--
        }
        return str
    }
}