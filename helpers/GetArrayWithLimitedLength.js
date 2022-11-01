// taulukko, jossa säilytetään 10 viimeisintä arvoa
// käytetään GPS-datan viimeisimpien tarkkuusarvojen säilyttämiseen ja käsittelyyn
// https://stackoverflow.com/questions/31023330/drop-last-element-of-javascript-array-when-array-reaches-specific-length

const GetArrayWithLimitedLength = (length) => {
    var array = new Array();

    array.push = function () {
        if (this.length >= length) {
            this.shift();
        }
        return Array.prototype.push.apply(this,arguments);
    }

    calcMean = () => {
        var total = 0;
        for (var i = 0; i < array.length; i++) {
            total += array[i]
        }
        var avg = total / array.length
        return avg;
    }

    return array;
}

export default GetArrayWithLimitedLength;