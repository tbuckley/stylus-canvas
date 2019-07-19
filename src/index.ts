/* eslint-env browser */
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["render"] }] */

import { LitElement, html, customElement, property, TemplateResult } from 'lit-element';
import { Dimensions, rotateDimensions } from './utils/dimensions.js';

declare const ResizeObserver: any;

// ROTATION_EPSILON is the amount to rotate the canvas when
// disabling low latency. It should be large enough to cause
// the canvas to drop out of a hw overlay, but not large enough
// to be noticeable to the user.
const ROTATION_EPSILON = 0.0001;

function getRotateTransform(rotation: number, disableLowLatency: boolean) {
  const finalRotation = rotation + (disableLowLatency ? ROTATION_EPSILON : 0);
  return `rotate(${finalRotation}deg)`;
}

function getTranslateTransform({ width, height }: Dimensions, rotation: number) {
  let shiftX = 0;
  let shiftY = 0;
  if (rotation === 90 || rotation === 270) {
    const [canvasWidth, canvasHeight] = [height, width];
    const w2 = canvasWidth / 2;
    const h2 = canvasHeight / 2;
    shiftX = h2 - w2;
    shiftY = w2 - h2;
  }
  return `translate(${shiftX}px, ${shiftY}px)`;
}

function getTransform({width, height}: Dimensions, rotation: number, disableLowLatency: boolean) {
  const rotateTransform = getRotateTransform(rotation, disableLowLatency);
  const translateTransform = getTranslateTransform({ width, height }, rotation);
  return `transform: ${translateTransform} ${rotateTransform};`;
}

@customElement("stylus-canvas")
export default class StylusCanvas extends LitElement {
  @property({type: Number}) width: number = 0;
  @property({type: Number}) height: number = 0;
  @property({type: Number}) rotation: number = 0;
  @property({type: Boolean}) disableLowLatency: boolean = false;

  constructor() {
    super();

    // Initialize properties
    this.width = 300; // <canvas> default
    this.height = 150; // <canvas> default
    this.rotation = window.screen.orientation.angle;
    this.disableLowLatency = false;

    // Observe resizes
    const resizeObserver = new ResizeObserver(() => {
      // Only resize if still visible in the DOM
      if (this.offsetParent !== null) {
        this.handleResize(this.clientWidth, this.clientHeight);
      }
    });
    resizeObserver.observe(this);

    // TODO detach observer

    // Observe orientation changes
    window.screen.orientation.onchange = () => {
      this.handleRotate(window.screen.orientation.angle);
    };
  }

  render(): TemplateResult {
    const { width, height, rotation } = this;
    const canvasDims = rotateDimensions({ width, height }, rotation);
    const elDims = { width: this.clientWidth, height: this.clientHeight };
    const canvasStyleDims = rotateDimensions(elDims, rotation);

    const { disableLowLatency } = this;
    const transform = getTransform(elDims, rotation, disableLowLatency);
    const style = `width: ${canvasStyleDims.width}px; height: ${canvasStyleDims.height}px; ${transform}`;

    return html`
      <style>
        :host {
          display: block;
          /*
          Necessary to prevent layout issues on 90/180deg. Layout will
          look at the pre-rotated dimensions.
          */
          overflow: hidden;
        }
        canvas {
          touch-action: none;
          transform-origin: 50% 50%;
        }
      </style>
      <canvas
        width="${canvasDims.width}"
        height="${canvasDims.height}"
        style="${style}"
      ></canvas>
    `;
  }

  async handleResize(width: number, height: number) {
    this.requestUpdate();
    await this.updateComplete;
    this.dispatchEvent(
      new CustomEvent('canvas-resize', {
        detail: { width, height },
      }),
    );
  }

  async handleRotate(rotation: number) {
    this.rotation = rotation;
    await this.updateComplete;
    this.dispatchEvent(
      new CustomEvent('canvas-rotate', {
        detail: {
          angle: this.rotation,
        },
      }),
    );
  }

  // API

  getContext(contextId: string, contextAttributes?: any) {
    const attributes: any = contextAttributes || {};
    
    // Check that parameters will allow for low-latency
    if (attributes.desynchronized !== true) {
      throw new Error('getContext(id, attrs) must include {desynchronized: true}');
    }

    const canvas = this.shadowRoot!.querySelector('canvas') as HTMLCanvasElement;
    return canvas.getContext(contextId, attributes);
  }
}
