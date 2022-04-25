import utils from '../utils.js'

export default class Serializer {
    // Special Chars
    static tokens = {
        // FF 00
        escape: [255, 0],
        // FF 01
        separator: [255, 1]
    }
    bytesOffset = 0

    constructor(ab) {
        this.holder = ab ? Array.from(new Uint8Array(ab)) : []
    }

    getHolder() {
        return utils.arrayBufferFromArray(this.holder)
    }

    pushSeparator() {
        this.holder.push(...Serializer.tokens.separator)
    }

    putBlock(ab) {
        const holder = this.holder
        const bufferView = new Uint8Array(ab)
        const separatorLength = Serializer.tokens.separator.length
        let queue = []
        let i = 0
        // Initialize the queue
        while (i < separatorLength && i < bufferView.length) {
            queue.push(bufferView[i])
            i++
        }
        i = queue.length
        while (i < bufferView.length + 1) {
            Object
                .keys(Serializer.tokens)
                .forEach(key => {
                    if (utils.isSameArray(queue, Serializer.tokens[key])) {
                        holder.push(...Serializer.tokens.escape)
                    }
                })
            if (i < bufferView.length) {
                if (queue.length === separatorLength) {
                    holder.push(queue.shift())
                }
                queue.push(bufferView[i])
            } else {
                holder.push(...queue)
            }
            i++
        }
        this.pushSeparator()
    }

    getBlock() {
        const holder = this.holder
        const separatorLength = Serializer.tokens.separator.length
        const block = []
        let queue = []
        let i = 0
        // Initialize the queue
        while (i < separatorLength && i + this.bytesOffset < holder.length) {
            queue.push(holder[i + this.bytesOffset])
            i++
        }
        i = queue.length + this.bytesOffset
        let escapeCount = 0
        while (i < holder.length + 1) {
            if (escapeCount === 0) {
                // Is escape char ?
                if (utils.isSameArray(queue, Serializer.tokens.escape)) {
                    escapeCount = separatorLength
                    queue = []
                }
                // Is separator char ?
                else if (utils.isSameArray(queue, Serializer.tokens.separator)) {
                    this.bytesOffset = i
                    return utils.arrayBufferFromArray(block)
                }
            } else {
                escapeCount--
            }
            if (i < holder.length) {
                if (queue.length === separatorLength) {
                    block.push(queue.shift())
                }
                queue.push(holder[i])
            } else {
                block.push(...queue)
                this.bytesOffset = holder.length
                return utils.arrayBufferFromArray(block)
            }
            i++
        }
    }
}