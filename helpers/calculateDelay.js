function calculateDelay(length) {
    if (length <= 100) {
        return 10;
    } else if (100 < length <= 200) {
        return 5;
    } else if (200 < length <= 500) {
        return 2;
    } else {
        return 1;
    }
}

module.exports = calculateDelay;