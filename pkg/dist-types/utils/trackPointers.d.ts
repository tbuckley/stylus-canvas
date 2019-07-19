export declare type Handler<S, P> = (state: S, point: P, e: PointerEvent) => S | null;
export interface IHandlers<S, P> {
    down?: Handler<S, P>;
    move?: Handler<S, P>;
    up?: Handler<S, P>;
    cancel?: Handler<S, P>;
}
export interface IOptions<S, P> {
    initState: () => S;
    createPoint: (e: PointerEvent) => P;
}
export default function trackPointers<S, P>(el: HTMLElement, handlers: IHandlers<S, P>, opts: IOptions<S, P>): void;
