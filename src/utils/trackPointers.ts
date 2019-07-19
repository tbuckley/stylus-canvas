export type Handler<S, P> = (state: S, point: P, e: PointerEvent) => S | null;

export interface IHandlers<S, P> {
  down?: Handler<S, P>;
  move?: Handler<S, P>;
  up?: Handler<S, P>;
  cancel?: Handler<S, P>;
}

type HandlerType<S, P> = keyof IHandlers<S, P>;

export interface IOptions<S, P> {
  initState: () => S;
  createPoint: (e: PointerEvent) => P;
}

interface IChromePointerEvent extends PointerEvent {
  getCoalescedEvents(): PointerEvent[];
}

export default function trackPointers<S, P>(
  el: HTMLElement,
  handlers: IHandlers<S, P>,
  opts: IOptions<S, P>) {

  const state: { [index: number]: S } = {};

  function getState(pointerId: number) {
    if (!(pointerId in state)) {
      state[pointerId] = opts.initState();
    }
    return state[pointerId];
  }

  function handle(fn: HandlerType<S, P>, e: IChromePointerEvent) {
    const handler = handlers[fn];
    if (!handler) {
      return;
    }

    const { pointerId } = e;

    let events = e.getCoalescedEvents();
    if (events.length === 0) {
      events = [e];
    }

    events.forEach((ce) => {
      const pointerState = getState(pointerId);
      const point = opts.createPoint(ce);
      const newState = handler.call(handlers, pointerState, point, e);
      if (newState === null) {
        delete state[pointerId];
      } else {
        state[pointerId] = newState;
      }
    });
  }

  // Necessary for preventing right-click menu as recently as Chrome M71
  el.addEventListener('touchstart', e => e.preventDefault());

  el.addEventListener('pointerdown', e => handle('down', e as IChromePointerEvent));
  el.addEventListener('pointermove', e => handle('move', e as IChromePointerEvent));
  el.addEventListener('pointerup', e => handle('up', e as IChromePointerEvent));
  el.addEventListener('pointercancel', e => handle('cancel', e as IChromePointerEvent));
}
