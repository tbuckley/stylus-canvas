export default class StrokeDrawer {
  constructor(canvas) {
    this.strokes = [];

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', {
      lowLatency: true,
      alpha: false,
    });

    this.ctx.lineWidth = 0.5;
    this.ctx.strokeStyle = '#000';
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

  drawSegment(start, end) {
    const { ctx } = this;
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  drawAll() {
    this.strokes.forEach((stroke) => {
      let prev = stroke[0];
      for (let i = 1; i < stroke.length; i += 1) {
        const p = stroke[i];
        this.drawSegment(prev, p);
        prev = p;
      }
    });
  }

  clear() {
    const { ctx, canvas } = this;
    ctx.fillStyle = '#FFF';
    const cr = canvas.getBoundingClientRect();
    ctx.fillRect(0, 0, cr.width, cr.height);
  }
}
