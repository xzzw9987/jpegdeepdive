import utils from '../utils.js'

export default class JPEG {
    // DCT Matrix
    static DCTMat = [
        [0.35355339, 0.35355339, 0.35355339, 0.35355339, 0.35355339, 0.35355339, 0.35355339, 0.35355339],
        [0.4903926, 0.41573481, 0.27778512, 0.09754516, -0.09754516, -0.27778512, -0.41573481, -0.4903926],
        [0.46193977, 0.19134172, -0.19134172, -0.46193977, -0.46193977, -0.19134172, 0.19134172, 0.46193977],
        [0.41573481, -0.09754516, -0.4903926, -0.27778512, 0.27778512, 0.4903926, 0.09754516, -0.41573481],
        [0.35355339, -0.35355339, -0.35355339, 0.35355339, 0.35355339, -0.35355339, -0.35355339, 0.35355339],
        [0.27778512, -0.4903926, 0.09754516, 0.41573481, -0.41573481, -0.09754516, 0.4903926, -0.27778512],
        [0.19134172, -0.46193977, 0.46193977, -0.19134172, -0.19134172, 0.46193977, -0.46193977, 0.19134172],
        [0.09754516, -0.27778512, 0.41573481, -0.4903926, 0.4903926, -0.41573481, 0.27778512, -0.09754516]
    ]
    static transposeDCTMat = utils.transpose(this.DCTMat);

    // JPEG Luminance Quantization Matrix
    static lumaQuantizationMat = [
        [16, 11, 10, 16, 24, 40, 51, 61],
        [12, 12, 14, 19, 26, 58, 60, 55],
        [14, 13, 16, 24, 40, 57, 69, 56],
        [14, 17, 22, 29, 51, 87, 80, 62],
        [18, 22, 37, 56, 68, 109, 103, 77],
        [24, 35, 55, 64, 81, 104, 113, 92],
        [49, 64, 78, 87, 103, 121, 120, 101],
        [72, 92, 95, 98, 112, 100, 103, 99]
    ]

    // JPEG Chrominance Quantization Matrix
    static chromaQuantizationMat = [
        [17, 18, 24, 47, 99, 99, 99, 99],
        [18, 21, 26, 66, 99, 99, 99, 99],
        [24, 26, 56, 99, 99, 99, 99, 99],
        [47, 66, 99, 99, 99, 99, 99, 99],
        [99, 99, 99, 99, 99, 99, 99, 99],
        [99, 99, 99, 99, 99, 99, 99, 99],
        [99, 99, 99, 99, 99, 99, 99, 99],
        [99, 99, 99, 99, 99, 99, 99, 99]
    ]

    compress({imageData, quality = 50}) {
        const {data, width, height} = imageData
        let y = []
        let quantifiedY = []
        let u = []
        let quantifiedU = []
        let v = []
        let quantifiedV = []
        const leveledLumaQuantizationMat = this.getLeveledLumaQuantizationMat(quality)
        const leveledChromaQuantizationMat = this.getLeveledChromaQuantizationMat(quality)
        for (let h = 0; h < height; h++) {
            for (let w = 0; w < width; w++) {
                const r = data[4 * (h * width + w)]
                const g = data[4 * (h * width + w) + 1]
                const b = data[4 * (h * width + w) + 2]
                const yuv = utils.RGBtoYUV(r, g, b)
                y[h * width + w] = yuv[0]
                u[h * width + w] = yuv[1]
                v[h * width + w] = yuv[2]
            }
        }

        y = utils.vec2Mat(y, width, height)
        u = utils.vec2Mat(u, width, height)
        v = utils.vec2Mat(v, width, height)

        for (let j = 0; j * 8 < height; j++) {
            for (let i = 0; i * 8 < width; i++) {
                // Extract every 8x8 block
                let yBlock = this.quantify8x8Block(
                    utils.sliceMat(y, j * 8, i * 8, 8, 8),
                    leveledLumaQuantizationMat)
                utils.matFill(quantifiedY, yBlock, j * 8, i * 8)
                let uBlock = this.quantify8x8Block(
                    utils.sliceMat(u, j * 8, i * 8, 8, 8),
                    leveledChromaQuantizationMat)
                utils.matFill(quantifiedU, uBlock, j * 8, i * 8)
                let vBlock = this.quantify8x8Block(
                    utils.sliceMat(v, j * 8, i * 8, 8, 8),
                    leveledChromaQuantizationMat)
                utils.matFill(quantifiedV, vBlock, j * 8, i * 8)
            }
        }
        return [
            quantifiedY,
            quantifiedU,
            quantifiedV
        ]
    }

/*    compress({imageData, quality = 50}) {
        const {data, width, height} = imageData
        let y = []
        let quantifiedY = []
        let u = []
        let quantifiedU = []
        let v = []
        let quantifiedV = []
        const leveledLumaQuantizationMat = this.getLeveledLumaQuantizationMat(quality)
        const leveledChromaQuantizationMat = this.getLeveledChromaQuantizationMat(quality)
        for (let h = 0; h < height; h++) {
            for (let w = 0; w < width; w++) {
                const r = data[4 * (h * width + w)]
                const g = data[4 * (h * width + w) + 1]
                const b = data[4 * (h * width + w) + 2]
                const yuv = utils.RGBtoYUV(r, g, b)
                y[h * width + w] = yuv[0]
                u[h * width + w] = yuv[1]
                v[h * width + w] = yuv[2]
            }
        }

        y = utils.vec2Mat(y, width, height)
        u = utils.vec2Mat(u, width, height)
        v = utils.vec2Mat(v, width, height)

        for (let j = 0; j * 8 < height; j++) {
            for (let i = 0; i * 8 < width; i++) {
                // Extract every 8x8 block
                let yBlock = this.quantify8x8Block(
                    utils.sliceMat(y, j * 8, i * 8, 8, 8),
                    leveledLumaQuantizationMat)
                utils.matFill(quantifiedY, yBlock, j * 8, i * 8)
                let uBlock = this.quantify8x8Block(
                    utils.sliceMat(u, j * 8, i * 8, 8, 8),
                    leveledChromaQuantizationMat)
                utils.matFill(quantifiedU, uBlock, j * 8, i * 8)
                let vBlock = this.quantify8x8Block(
                    utils.sliceMat(v, j * 8, i * 8, 8, 8),
                    leveledChromaQuantizationMat)
                utils.matFill(quantifiedV, vBlock, j * 8, i * 8)
            }
        }
        return [
            quantifiedY,
            quantifiedU,
            quantifiedV
        ]
    }*/

    decompress(quantifiedY, quantifiedU, quantifiedV, quality = 50) {
        const leveledLumaQuantizationMat = this.getLeveledLumaQuantizationMat(quality)
        const leveledChromaQuantizationMat = this.getLeveledChromaQuantizationMat(quality)
        const height = quantifiedY.length
        const width = quantifiedY[0].length
        const r = []
        const g = []
        const b = []
        for (let j = 0; j * 8 < height; j++) {
            for (let i = 0; i * 8 < width; i++) {
                let yBlock = utils.sliceMat(quantifiedY, j * 8, i * 8, 8, 8)
                let uBlock = utils.sliceMat(quantifiedU, j * 8, i * 8, 8, 8)
                let vBlock = utils.sliceMat(quantifiedV, j * 8, i * 8, 8, 8)
                yBlock = this.dequantify8x8Block(yBlock, leveledLumaQuantizationMat)
                uBlock = this.dequantify8x8Block(uBlock, leveledChromaQuantizationMat)
                vBlock = this.dequantify8x8Block(vBlock, leveledChromaQuantizationMat)
                const rgbBlock = this.rgbFrom8x8YUVBlock(yBlock, uBlock, vBlock)
                utils.matFill(r, rgbBlock[0], j * 8, i * 8)
                utils.matFill(g, rgbBlock[1], j * 8, i * 8)
                utils.matFill(b, rgbBlock[2], j * 8, i * 8)
            }
        }
        return [r, g, b]
    }

    quantify8x8Block(block, quantizationMat) {
        // Zero centered
        block = utils.matAddScalar(block, -128)
        // DCT transform, DCT Matrix * block * Transposed DCT Matrix
        block = utils.matMul(JPEG.DCTMat, block)
        block = utils.matMul(block, JPEG.transposeDCTMat)
        // Quantization
        block = utils.matDivideRound(block, quantizationMat)
        return block
    }

    dequantify8x8Block(block, quantizationMat) {
        block = utils.matMulByMatRound(block, quantizationMat)
        block = utils.matMul(JPEG.transposeDCTMat, block)
        block = utils.matMul(block, JPEG.DCTMat)
        block = utils.matAddScalar(block, 128)
        return block
    }

    rgbFrom8x8YUVBlock(yBlock, uBlock, vBlock) {
        const r = []
        const g = []
        const b = []
        for (let j = 0; j < 8; j++) {
            for (let i = 0; i < 8; i++) {
                const rgb = utils.YUVtoRGB(yBlock[j][i], uBlock[j][i], vBlock[j][i])

                if (!r[j]) {
                    r[j] = []
                }
                if (!g[j]) {
                    g[j] = []
                }
                if (!b[j]) {
                    b[j] = []
                }

                r[j][i] = rgb[0]
                g[j][i] = rgb[1]
                b[j][i] = rgb[2]
            }
        }
        return [r, g, b]
    }

    getLeveledLumaQuantizationMat(quality) {
        return utils.matMulScalar(
            JPEG.lumaQuantizationMat,
            quality < 50 ? 50 / quality : (100 - quality) / 50,
            v => utils.clamp(v, 1, 255)
        )
    }

    getLeveledChromaQuantizationMat(quality) {
        return utils.matMulScalar(
            JPEG.chromaQuantizationMat,
            quality < 50 ? 50 / quality : (100 - quality) / 50,
            v => utils.clamp(v, 1, 255)
        )
    }
}