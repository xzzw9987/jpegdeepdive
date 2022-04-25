import JPEG from '../src/jpeg/index.js'
import utils from '../src/utils.js'
import RLE from '../src/deflate/RLE.js'
import CanonicalHuffman from '../src/deflate/CanonicalHuffman.js'


(function testJPEG() {
    /* const a = [
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],

         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
         [1,2,3,4,5,6,7,8, 9, 10, 11, 12, 13, 14, 15, 16],
     ]
     utils.debug('zig zag', utils.zigZagOrderEncode(a))*/
    const rle = new RLE()
    const jpeg = new JPEG()

    const image = new Image()
    image.src = 'fixture.jpeg'
    const canvas = document.querySelector('.canvas-input');
    const ctx = canvas.getContext('2d');
    image.onload = () => {
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        utils.debug('canvas width', canvas.width)
        utils.debug('canvas height', canvas.height)
        ctx.drawImage(image, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const draw = (quality = 100) => {
            const d = new Date()
            const yuv = jpeg.compress({imageData, quality})
            window.compress = () => {
                // yuv420

                const buf =
                    (new Int8Array([
                        ...utils.zigZagOrderEncode(yuv[0]),
                        ...utils.zigZagOrderEncode(utils.sliceMat(yuv[1], 0, 0, yuv[1].length / 2, yuv[1].length / 2)),
                        ...utils.zigZagOrderEncode(utils.sliceMat(yuv[2], 0, 0, yuv[2].length / 2, yuv[2].length / 2)),
                        // ...utils.zigZagOrderEncode(yuv[1]),
                        // ...utils.zigZagOrderEncode(yuv[2])
                    ])).buffer
                const d = new Date()
                utils.debug('original buffer', buf)

                /*                const freqList = utils.getFrequencyList(new Uint8Array(buf))
                                utils.debug('freqList', freqList, Object.keys(freqList).length)
                                const canonicalHuffman = new CanonicalHuffman()
                                utils.debug('token table',
                                    canonicalHuffman.buildTokenTable(
                                        Object.keys(freqList).map(key => ({
                                                val: key,
                                                frequency: freqList[key]
                                            })
                                        )
                                    ))
                                const huffmanEncode = canonicalHuffman.encode(buf)
                                const rleBuf = rle.encode(huffmanEncode)
                                utils.debug('rle encode', rleBuf)*/

                const rleBuf = rle.encode(buf)
                utils.debug('rle encode', rleBuf)
                const freqList = utils.getFrequencyList(new Uint8Array(rleBuf))
                utils.debug('freqList', freqList, Object.keys(freqList).length)

                const canonicalHuffman = new CanonicalHuffman()
                utils.debug('token table',
                    canonicalHuffman.buildTokenTable(
                        Object.keys(freqList).map(key => ({
                                val: key,
                                frequency: freqList[key]
                            })
                        )
                    ))
                const huffmanEncode = canonicalHuffman.encode(rleBuf)

                utils.debug('huffman encode ', huffmanEncode)
            }

            /*const rgb = jpeg.decompress(...yuv, quality)
            utils.debug('Time consumption:', new Date() - d)

            const canvas2 = document.querySelector('.canvas-output')
            const context2 = canvas2.getContext('2d')
            canvas2.width = canvas.width
            canvas2.height = canvas.height
            const imageData2 = context2.getImageData(0, 0, canvas2.width, canvas2.height)

            for (let h = 0; h < rgb[0].length; h++) {
                for (let w = 0; w < rgb[0][0].length; w++) {
                    if (h < canvas2.height && w < canvas2.width) {
                        imageData2.data[4 * (h * canvas2.width + w)] = rgb[0][h][w]
                        imageData2.data[4 * (h * canvas2.width + w) + 1] = rgb[1][h][w]
                        imageData2.data[4 * (h * canvas2.width + w) + 2] = rgb[2][h][w]
                        imageData2.data[4 * (h * canvas2.width + w) + 3] = 255
                    }
                }
            }
            context2.putImageData(imageData2, 0, 0)*/
        }
        window.draw = draw
        draw()
        window.compress()
        // draw()
        // @todo ZigZag
    }
})()
