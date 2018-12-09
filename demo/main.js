/* eslint-env browser */

import '../src/stylus-canvas';
import updateTransform from '../src/2d/updateTransform';

let canvas = null;
let ctx = null;
const STROKES = [];

function getPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function drawLatestStrokePortion(strokes) {
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = '#000';

  const lastStroke = strokes[strokes.length - 1];
  const prev = lastStroke[lastStroke.length - 2];
  const p = lastStroke[lastStroke.length - 1];
  ctx.moveTo(prev.x, prev.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

function drawAllStrokes(strokes) {
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = '#000';

  strokes.forEach((stroke) => {
    ctx.beginPath();

    let prev = stroke[0];
    for (let i = 1; i < stroke.length; i += 1) {
      const p = stroke[i];
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      prev = p;
    }
  });
}

async function main() {
  // Get the canvas
  canvas = document.querySelector('stylus-canvas');

  await canvas.updateComplete;
  ctx = canvas.getContext('2d', { lowLatency: true });

  const ratio = window.devicePixelRatio;
  canvas.width = canvas.clientWidth * ratio;
  canvas.height = canvas.clientHeight * ratio;

  await canvas.updateComplete;
  updateTransform(ctx, canvas);
  ctx.scale(ratio, ratio);
  drawAllStrokes(STROKES);

  let isDrawing = false;

  // Set up resize/rotate handlers
  canvas.addEventListener('canvas-resize', async (e) => {
    canvas.width = e.detail.width * ratio;
    canvas.height = e.detail.height * ratio;
    await canvas.updateComplete;
    updateTransform(ctx, canvas);
    ctx.scale(ratio, ratio);

    drawAllStrokes(STROKES);
  });
  canvas.addEventListener('canvas-rotate', () => {
    updateTransform(ctx, canvas);
    ctx.scale(ratio, ratio);
    drawAllStrokes(STROKES);
  });

  canvas.addEventListener('pointerdown', (e) => {
    const p = getPoint(e);
    STROKES.push([p]);
    isDrawing = true;
  });
  canvas.addEventListener('pointermove', (e) => {
    if (isDrawing) {
      const p = getPoint(e);
      STROKES[STROKES.length - 1].push(p);
      drawLatestStrokePortion(STROKES);
    }
  });
  canvas.addEventListener('pointerup', () => {
    isDrawing = false;
  });
}

main();
