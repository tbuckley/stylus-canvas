export interface Dimensions {
  width: number;
  height: number;
}

export function rotateDimensions({ width, height }: Dimensions, rotation: number) {
  if (rotation === 0 || rotation === 180) {
    return { width, height };
  }
  return { width: height, height: width };
}