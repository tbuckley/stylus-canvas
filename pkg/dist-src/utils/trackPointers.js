function createPointFn(el) {
  return function defaultPointFn(e) {
    const cr = el.getBoundingClientRect();
    return {
      x: e.clientX - cr.left,
      y: e.clientY - cr.top
    };
  };
}

export default function trackPointers(el, handlers, initStateOpt, pointFnOpt) {
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

    const {
      pointerId
    } = e;
    let events = e.getCoalescedEvents();

    if (events.length === 0) {
      events = [e];
    }

    events.forEach(ce => {
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