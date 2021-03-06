/* eslint-env browser */

import '../../pkg/dist-src/index';
import updateTransform from '../../pkg/dist-src/2d/updateTransform';
import trackPointers from '../../pkg/dist-src/utils/trackPointers';
import StrokeDrawer from '../../pkg/dist-src/utils/StrokeDrawer2d';

async function main() {
  // Get the canvas & wait for it to render
  const canvas = document.querySelector('stylus-canvas');
  await canvas.updateComplete;

  // Scale the canvas for HiDPI
  const ratio = window.devicePixelRatio;
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;
  await canvas.updateComplete;

  // Initialize drawer
  const drawer = new StrokeDrawer(canvas);
  window.drawer = drawer;

  function resetContext() {
    updateTransform(drawer.ctx, canvas);
    drawer.ctx.scale(ratio, ratio);
    drawer.clear();
    drawer.drawAll();
  }
  resetContext();

  // Set up resize/rotate handlers
  canvas.addEventListener('canvas-resize', async (e) => {
    canvas.width = e.detail.width * ratio;
    canvas.height = e.detail.height * ratio;
    await canvas.updateComplete;
    resetContext();
  });
  canvas.addEventListener('canvas-rotate', () => {
    resetContext();
  });

  // Handle input
  trackPointers(canvas, {
    down: (_, p) => {
      const strokeId = drawer.startStroke(p);
      return { isDown: true, strokeId };
    },
    move: (state, p) => {
      if (state.isDown) {
        drawer.addPoint(state.strokeId, p);
      }
      return state;
    },
    up: () => ({
      isDown: false,
    }),
    cancel: (state, _) => {
      drawer.removeStroke(state.strokeId);
      return { isDown: false };
    },
  }, {
    initState: () => ({ isDrawing: false }),
    createPoint: (e) => ({x: e.clientX, y: e.clientY}),
  });
}

main();
