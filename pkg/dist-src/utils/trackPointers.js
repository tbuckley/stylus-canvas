export default function trackPointers(el, handlers, opts) {
    const state = {};
    function getState(pointerId) {
        if (!(pointerId in state)) {
            state[pointerId] = opts.initState();
        }
        return state[pointerId];
    }
    function handle(fn, e) {
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
            }
            else {
                state[pointerId] = newState;
            }
        });
    }
    // Necessary for preventing right-click menu as recently as Chrome M71
    el.addEventListener('touchstart', e => e.preventDefault());
    el.addEventListener('pointerdown', e => handle('down', e));
    el.addEventListener('pointermove', e => handle('move', e));
    el.addEventListener('pointerup', e => handle('up', e));
    el.addEventListener('pointercancel', e => handle('cancel', e));
}
