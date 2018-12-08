// TODO reuse rotateDimensions
function rotateDimensions({ width, height }, rotation) {
  if (rotation === 0 || rotation === 180) {
    return { width, height };
  }
  return { width: height, height: width };
}

// updateTransform will rotate/translate the context to account for
// the rotation of the stylus canvas.
export default function updateTransform(ctx, { width, height }, rotation) {
  // Reset transform
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  // Move origin based on rotation
  const { canvasWidth, canvasHeight } = rotateDimensions({ width, height }, rotation);
  switch (rotation) {
    case 90: ctx.translate(0, canvasHeight); break;
    case 180: ctx.translate(canvasWidth, canvasHeight); break;
    case 270: ctx.translate(canvasWidth, 0); break;
    default: break;
  }

  // Rotate context
  const angleRadians = rotation * Math.PI / 180;
  ctx.rotate(-angleRadians);
}
