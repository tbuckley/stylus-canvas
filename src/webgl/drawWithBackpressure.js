// drawWithBackPressure will ensure that draw calls do not overload the GPU.
// Without this, the app can send too many draw calls and they will become
// more and more delayed.
let fence = null;
export default function drawWithBackPressure(ctx, drawFn) {
  if (fence && ctx.getSyncParameter(fence, ctx.SYNC_STATUS) === ctx.UNSIGNALED) {
    return; // Skip a frame to not overload the GL command queue.
  }
  drawFn();
  fence = ctx.fenceSync(ctx.SYNC_GPU_COMMANDS_COMPLETE, 0); // Insert a fence.
}
