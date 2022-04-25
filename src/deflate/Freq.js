import utils from '../utils.js'

export default class Freq {
    freq = {}

    constructor(data) {
        if (data) {
            for (let v of data) {
                this.update(v)
            }
        }
    }

    update(val) {
        this.freq[val] = (this.freq[val] || 0) + 1
    }

    getFreq(sortFunc) {
        if (typeof sortFunc === 'function') {
            return Object
                .keys(this.freq)
                .sort(sortFunc)
                .map(k => ({
                    val: k,
                    frequency: this.freq[k]
                }))
        }
        return this.freq
    }
}