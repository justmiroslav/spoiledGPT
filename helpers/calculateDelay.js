function calculateDelay(length) {
    if (length <= 100) {
        return 100;
    } else if (100 < length <= 200) {
        return 50;
    } else if (200 < length <= 500) {
        return 20;
    } else {
        return 10;
    }
}

module.exports = calculateDelay;