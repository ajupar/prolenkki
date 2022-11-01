
const CalculateArrayMean = (array) => {

    var total = 0;
    for (var i = 0; i < array.length; i++) {
        total += array[i]
    }
    var avg = total / array.length
    return avg;
}

export default CalculateArrayMean;