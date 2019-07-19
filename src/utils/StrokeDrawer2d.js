/* eslint-env browser */

function drawSegment(ctx, start, end) {
  ctx.moveTo(start.x, start.y);
  ctx.lineTo(end.x, end.y);
}

function strokeWithStyle(ctx) {
  ctx.lineWidth = 0.5;
  ctx.strokeStyle = '#000';
  ctx.stroke();
}

function drawFrame(ctx) {
  strokeWithStyle(ctx);
  ctx.beginPath();
}

export default class StrokeDrawer2d {
  constructor(canvas) {
    this.strokes = [];
    this.drawFrameRequested = false;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      desynchronized: true,
      alpha: false,
    });
  }

  startStroke(point) {
    this.strokes.push([point]);
    return this.strokes.length - 1;
  }

  addPoint(strokeId, point) {
    const stroke = this.strokes[strokeId];
    const prev = stroke[stroke.length - 1];
    stroke.push(point);
    this.drawSegment(prev, point);
  }

  // SLOW! Requires full redraw
  removeStroke(strokeId) {
    this.strokes[strokeId] = [];
    this.clear();
    this.drawAll();
  }

  requestDrawFrame() {
    if (!this.drawFrameRequested) {
      this.drawFrameRequested = true;
      requestAnimationFrame(() => {
        drawFrame(this.ctx);
        this.drawFrameRequested = false;
      });
    }
  }

  drawSegment(start, end) {
    this.requestDrawFrame();
    const { ctx } = this;
    drawSegment(ctx, start, end);
  }

  drawAll() {
    const { ctx } = this;
    this.strokes.forEach((stroke) => {
      let prev = stroke[0];
      ctx.beginPath();
      for (let i = 1; i < stroke.length; i += 1) {
        const p = stroke[i];
        drawSegment(ctx, prev, p);
        prev = p;
      }
      strokeWithStyle(ctx);
    });
  }

  clear() {
    const { ctx, canvas } = this;
    ctx.fillStyle = '#FFF';
    const cr = canvas.getBoundingClientRect();
    ctx.fillRect(0, 0, cr.width, cr.height);
  }
}
