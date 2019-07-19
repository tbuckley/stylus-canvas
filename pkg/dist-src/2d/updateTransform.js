// TODO reuse rotateDimensions
function rotateDimensions({
  width,
  height
}, rotation) {
  if (rotation === 0 || rotation === 180) {
    return {
      width,
      height
    };
  }

  return {
    width: height,
    height: width
  };
} // updateTransform will rotate/translate the context to account for
// the rotation of the stylus canvas.


export default function updateTransform(ctx, canvas) {
  // Reset transform
  ctx.setTransform(1, 0, 0, 1, 0, 0); // Move origin based on rotation

  const {
    width,
    height
  } = canvas;
  const canvasDims = rotateDimensions({
    width,
    height
  }, canvas.rotation);

  switch (canvas.rotation) {
    case 90:
      ctx.translate(0, canvasDims.height);
      break;

    case 180:
      ctx.translate(canvasDims.width, canvasDims.height);
      break;

    case 270:
      ctx.translate(canvasDims.width, 0);
      break;

    default:
      break;
  } // Rotate context


  const angleRadians = canvas.rotation * Math.PI / 180;
  ctx.rotate(-angleRadians);
}