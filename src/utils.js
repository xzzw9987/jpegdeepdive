export default {
    isSameArray(a, b) {
        if (a.length !== b.length) return false
        for (let k in a) {
            if (a[k] !== b[k]) return false
        }
        return true
    },
    arrayBufferFromArray(arr) {
        return (new Uint8Array(arr)).buffer
    },
    padStartWithZero(numOrString, maxLength) {
        // if numOrString is a number, convert it to string with radix 2
        if (typeof numOrString === 'number')
            numOrString = numOrString.toString(2)
        return numOrString.padStart(maxLength, '0')
    },
    getFrequencyList(data) {
        const result = {}
        for (let val of data) {
            result[val] = (result[val] || 0) + 1
        }
        return result
    },
    RGBtoYUV(r, g, b) {
        // [Y, U, V]
        return [
            Math.round(0.299 * r + 0.587 * g + 0.114 * b),
            Math.round(-0.169 * r - 0.331 * g + 0.500 * b + 128),
            Math.round(0.500 * r - 0.439 * g - 0.081 * b + 128)
        ]
    },
    YUVtoRGB(y, u, v) {
        // [R, G, B]
        return [
            Math.round(y + 1.402 * (v - 128)),
            Math.round(y - 0.344 * (u - 128) - 0.792 * (v - 128)),
            Math.round(y + 1.772 * (u - 128))
        ]
    },
    matAddScalar(mat, num) {
        for (let i = 0; i < mat.length; i++) {
            const s = mat[i]
            for (let j = 0; j < mat[i].length; j++) {
                s[j] += num
            }
        }
        return mat
    },
    matMul(a, b) {
        let result = []
        for (let i = 0; i < a.length; i++) {
            const n = []
            result[i] = n
            const m = a[i]
            const aLength = a[0].length
            const bLength = b[0].length
            for (let j = 0; j < bLength; j++) {
                let sum = 0
                for (let k = 0; k < aLength; k++) {
                    sum += m[k] * b[k][j]
                }
                n[j] = sum
            }
        }
        return result
    },
    matMulScalar(mat, num, valueProcess) {
        let result = []
        for (let i = 0; i < mat.length; i++) {
            const n = []
            result[i] = n
            const m = mat[i]
            const length = mat[0].length
            for (let j = 0; j < length; j++) {
                n[j] = typeof valueProcess === 'function' ? valueProcess(m[j] * num) : m[j] * num
            }
        }
        return result
    },
    matFill(mat1, mat2, fromRow, fromCol) {
        for (let i = 0; i < mat2.length; i++) {
            if (!mat1[i + fromRow]) mat1[i + fromRow] = []
            for (let j = 0; j < mat2[0].length; j++) {
                mat1[i + fromRow][j + fromCol] = mat2[i][j]
            }
        }
        return mat1
    },
    vec2Mat(vec, cols, rows) {
        let result = []
        for (let i = 0; i < rows; i++) {
            result[i] = []
            for (let j = 0; j < cols; j++) {
                result[i][j] = vec[i * cols + j]
            }
        }
        return result
    },
    mat2Vec(mat) {
        let result = []
        for (let i = 0; i < mat.length; i++) {
            for (let j = 0; j < mat[0].length; j++) {
                result.push(mat[i][j])
            }
        }
        return result
    },
    transpose(mat) {
        let result = []
        for (let i = 0; i < mat[0].length; i++) {
            result[i] = []
            for (let j = 0; j < mat.length; j++) {
                result[i][j] = mat[j][i]
            }
        }
        return result
    },
    matDivide(a, b) {
        let result = []
        for (let i = 0; i < a.length; i++) {
            result[i] = []
            for (let j = 0; j < a[0].length; j++) {
                result[i][j] = a[i][j] / b[i][j]
            }
        }
        return result
    },
    matDivideRound(a, b) {
        let result = []
        for (let i = 0; i < a.length; i++) {
            result[i] = []
            for (let j = 0; j < a[0].length; j++) {
                result[i][j] = Math.round(a[i][j] / b[i][j])
            }
        }
        return result
    },
    matMulByMatRound(a, b) {
        let result = []
        for (let i = 0; i < a.length; i++) {
            result[i] = []
            for (let j = 0; j < a[0].length; j++) {
                result[i][j] = Math.round(a[i][j] * b[i][j])
            }
        }
        return result
    },
    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max)
    },
    sliceMat(mat, fromRow, fromCol, rowNums, colNums) {
        const slicedMat = []
        for (let h = 0; h < rowNums; h++) {
            slicedMat[h] = []
            for (let w = 0; w < colNums; w++) {
                if (mat[fromRow + h] === void 0 || mat[fromRow + h][fromCol + w] === void 0) {
                    // Zero padding
                    slicedMat[h][w] = 0
                } else {
                    slicedMat[h][w] = mat[fromRow + h][fromCol + w]
                }
            }
        }
        return slicedMat
    },
    /**
     * Zig-Zag order encode
     * Return one-dimension array
     * @param {Array} mat
     * @param data
     */
    zigZagOrderEncode(mat) {
        const dir = {
            right: 0,
            leftDown: 1,
            down: 2,
            rightUp: 3
        }
        const leftUpOrder = [
            dir.right, dir.leftDown, dir.down, dir.rightUp
        ]
        const rightDownOrder = [
            dir.right, dir.rightUp, dir.down, dir.leftDown
        ]
        const ret = []
        for(let j = 0 ; j * 8 < mat.length; j++) {
            for (let i = 0 ; i * 8 < mat[0].length; i++) {
                const result = []
                let rows = 8
                let cols = 8
                let h = 0
                let w = 0
                let currentDirIndex = -1
                let isInLeftUp = true
                result.push(mat[h + j * 8][w + i * 8])
                while (!(h === rows - 1 && w === cols - 1)) {
                    if (h === rows - 1 && w === 0) {
                        isInLeftUp = false
                        currentDirIndex = -1
                    }
                    const dirOrder = isInLeftUp ? leftUpOrder : rightDownOrder
                    if (h === 0 || h === rows - 1 || w === 0 || w === cols - 1) {
                        currentDirIndex = (currentDirIndex + 1) % 4
                    }
                    if (dirOrder[currentDirIndex] === dir.right) {
                        w++
                    } else if (dirOrder[currentDirIndex] === dir.leftDown) {
                        h++
                        w--
                    } else if (dirOrder[currentDirIndex] === dir.down) {
                        h++
                    } else if (dirOrder[currentDirIndex] === dir.rightUp) {
                        h--
                        w++
                    }
                    result.push(mat[h + j * 8][w + i * 8])
                }
                ret.push(...result)
            }
        }
        return ret
    },
    assert(v, thrownMessage) {
        if (
            v === false ||
            v === null ||
            v === undefined
        ) throw new Error(thrownMessage)
    },
    debug(...args) {
        // console.trace()
        console.log(...args)
    }
}
