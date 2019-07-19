export function rotateDimensions({ width, height }, rotation) {
    if (rotation === 0 || rotation === 180) {
        return { width, height };
    }
    return { width: height, height: width };
}
