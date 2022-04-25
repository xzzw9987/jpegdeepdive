import utils from '../utils.js'
import BitsReader from './io/BitsReader.js'
import BitsWriter from './io/BitsWriter.js'

export default class CanonicalHuffman {
    tokenTable = null
    endKey = '__preserved__end__'

    constructor(tokenTable) {
        this.tokenTable = tokenTable
    }

    buildTokenTable(frequencyList = []) {
        // push the preserved end key
        frequencyList = frequencyList.concat({val: this.endKey, frequency: 0})
        const compareFn = (a, b) => {
            return a.frequency - b.frequency
        }
        // build original huffman tree
        const nodesArr = frequencyList.slice(0).sort(compareFn)
        while (nodesArr.length > 1) {
            const node1 = nodesArr.shift()
            const node2 = nodesArr.shift()
            const parent = {
                frequency: node1.frequency + node2.frequency,
                left: node1,
                right: node2
            }
            nodesArr.push(parent)
            nodesArr.sort(compareFn)
        }
        // generate canonical huffman code from tokenTable
        const tokenTable = {}
        const tokenStack = ['']
        while (nodesArr.length) {
            const currentToken = tokenStack.shift()
            const node = nodesArr.shift()

            if (node.right) {
                if (node.right.val === void 0) {
                    nodesArr.unshift(node.right)
                    tokenStack.unshift(currentToken + '1')
                } else {
                    tokenTable[node.right.val] = currentToken + '1'
                }
            }

            if (node.left) {
                if (node.left.val === void 0) {
                    nodesArr.unshift(node.left)
                    tokenStack.unshift(currentToken + '0')
                } else {
                    tokenTable[node.left.val] = currentToken + '0'
                }
            }
        }

        const codeLength = frequencyList
            .map(v => ({
                val: v.val,
                length: tokenTable[v.val].length
            }))
            .sort((a, b) => {
                return a.length - b.length
            })

        let token = (new Array(codeLength[0].length)).fill('0').join('')
        const result = {
            [codeLength[0].val]: token
        }
        for (let i = 1; i < codeLength.length; i++) {
            let currentToken = (parseInt(token, 2) + 1).toString(2)
            while (currentToken.length < token.length) {
                currentToken = '0' + currentToken
            }
            while (currentToken.length < codeLength[i].length) {
                currentToken += '0'
            }
            token = currentToken
            result[codeLength[i].val] = token
        }
        this.tokenTable = result
        return result
    }

    encode(uncompressed) {
        utils.assert(this.tokenTable, 'tokenTable is not built')
        if (uncompressed instanceof ArrayBuffer) {
            uncompressed = new Uint8Array(uncompressed)
        }
        const bitsWriter = new BitsWriter()
        for (let val of uncompressed) {
            utils.assert(this.tokenTable[val], `${val} is not in token list.`)
            bitsWriter.write(this.tokenTable[val])
        }
        bitsWriter.write(this.tokenTable[this.endKey])
        return bitsWriter.getArrayBuffer()
    }

    decode(compressed) {
        utils.assert(this.tokenTable, 'tokenTable is not built')
        let reachEnd = false
        const bitsReader = new BitsReader(compressed)
        const reverseTokenTable =
            Object
                .keys(this.tokenTable)
                .reduce((acc, key) => {
                    acc[this.tokenTable[key]] = key
                    return acc
                }, {})
        return {
            next: () => {
                if (reachEnd) return null
                let str = ''
                while (!reverseTokenTable[str]) {
                    const t = bitsReader.read(1)
                    if (!t) {
                        reachEnd = true
                        return null
                    }
                    str += t
                }
                const token = reverseTokenTable[str]
                if (token === this.endKey) {
                    reachEnd = true
                    return null
                }
                return token
            }
        }
    }
}