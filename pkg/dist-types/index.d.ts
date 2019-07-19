import { LitElement, TemplateResult } from 'lit-element';
export default class StylusCanvas extends LitElement {
    width: number;
    height: number;
    rotation: number;
    disableLowLatency: boolean;
    constructor();
    render(): TemplateResult;
    handleResize(width: number, height: number): Promise<void>;
    handleRotate(rotation: number): Promise<void>;
    getContext(contextId: string, contextAttributes?: any): CanvasRenderingContext2D | WebGLRenderingContext | null;
}
