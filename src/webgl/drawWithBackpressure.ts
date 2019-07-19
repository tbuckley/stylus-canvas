// drawWithBackPressure will ensure that draw calls do not overload the GPU.
// Without this, the app can send too many draw calls and they will become
// more and more delayed.
let fence: WebGLSync | null = null;
export default function drawWithBackPressure(gl: WebGL2RenderingContext, drawFn: () => void) {
  if (fence && gl.getSyncParameter(fence, gl.SYNC_STATUS) === gl.UNSIGNALED) {
    return; // Skip a frame to not overload the GL command queue.
  }
  drawFn();
  fence = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0); // Insert a fence.
}
