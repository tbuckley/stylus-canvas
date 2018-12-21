/* eslint-env browser */

import '../src/stylus-canvas';
import updateTransform from '../src/2d/updateTransform';

function createPointFn(el) {
  return function defaultPointFn(e) {
    const cr = el.getBoundingClientRect();
    return {
      x: e.clientX - cr.left,
      y: e.clientY - cr.top,
    };
  };
}

function trackPointers(el, handlers, initStateOpt, pointFnOpt) {
  const initState = initStateOpt || (() => ({}));
  const pointFn = pointFnOpt || createPointFn(el);
  const state = {};

  function getState(pointerId) {
    if (!(pointerId in state)) {
      state[pointerId] = initState();
    }
    return state[pointerId];
  }

  function handle(fn, e) {
    if (!(fn in handlers)) {
      return;
    }

    const { pointerId } = e;

    let events = e.getCoalescedEvents();
    if (events.length === 0) {
      events = [e];
    }

    events.forEach((ce) => {
      const pointerState = getState(pointerId);
      const point = pointFn(ce);
      const newState = handlers[fn](point, pointerState);
      if (newState === null) {
        delete state[pointerId];
      } else {
        state[e.pointerId] = newState;
      }
    });
  }

  el.addEventListener('pointerdown', e => handle('down', e));
  el.addEventListener('pointermove', e => handle('move', e));
  el.addEventListener('pointerup', e => handle('up', e));
  el.addEventListener('pointercancel', e => handle('cancel', e));
}

class Drawer2d {
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
  const drawer = new Drawer2d(canvas);
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
    down: (p) => {
      const strokeId = drawer.startStroke(p);
      return { isDown: true, strokeId };
    },
    move: (p, state) => {
      if (state.isDown) {
        drawer.addPoint(state.strokeId, p);
      }
      return state;
    },
    up: () => ({
      isDown: false,
    }),
  }, () => ({ isDrawing: false }));
}

main();
