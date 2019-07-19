import StylusCanvas from "..";
interface Point {
    x: number;
    y: number;
}
declare type Stroke = Point[];
export default class StrokeDrawer2d {
    strokes: Stroke[];
    drawFrameRequested: boolean;
    canvas: StylusCanvas;
    ctx: CanvasRenderingContext2D;
    constructor(canvas: StylusCanvas);
    startStroke(point: Point): number;
    addPoint(strokeId: number, point: Point): void;
    removeStroke(strokeId: number): void;
    requestDrawFrame(): void;
    drawSegment(start: Point, end: Point): void;
    drawAll(): void;
    clear(): void;
}
export {};
