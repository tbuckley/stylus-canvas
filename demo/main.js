/* eslint-env browser */

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
  ctx.strokeStyle = '#000';

  const lastStroke = strokes[strokes.length - 1];
  const prev = lastStroke[lastStroke.length - 2];
  const p = lastStroke[lastStroke.length - 1];
  ctx.moveTo(prev.x, prev.y);
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
}

function drawAllStrokes(strokes) {
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 600, 400);

  // Draw arrow
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

function main() {
  // Get the canvas
  canvas = document.querySelector('stylus-canvas');
  ctx = canvas.getContext('2d', { lowLatency: true });

  let isDrawing = false;

  // Set up resize/rotate handlers
  canvas.addEventListener('resize', () => drawAllStrokes(STROKES));
  canvas.addEventListener('rotate', (e) => {
    canvas.updateTransform2d(ctx);
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

async function init() {
  // Wait for canvas to exist
  if (!customElements.get('stylus-canvas')) {
    await customElements.whenDefined('stylus-canvas');
  }
  main();
}

init();
