/* eslint-env browser */
/* eslint class-methods-use-this: ["error", { "exceptMethods": ["render"] }] */

import { LitElement, html } from '@polymer/lit-element';

// ROTATION_EPSILON is the amount to rotate the canvas when
// disabling low latency. It should be large enough to cause
// the canvas to drop out of a hw overlay, but not large enough
// to be noticeable to the user.
const ROTATION_EPSILON = 0.0001;

function rotateDimensions({ width, height }, rotation) {
  if (rotation === 0 || rotation === 180) {
    return { width, height };
  }
  return { width: height, height: width };
}

function getRotateTransform(rotation, disableLowLatency) {
  const finalRotation = rotation + (disableLowLatency ? ROTATION_EPSILON : 0);
  return `rotate(${finalRotation}deg)`;
}

function getTranslateTransform({ width, height }, rotation) {
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

function getTransform({
  width, height, rotation, disableLowLatency,
}) {
  const rotateTransform = getRotateTransform(rotation, disableLowLatency);
  const translateTransform = getTranslateTransform({ width, height }, rotation);
  return `transform: ${translateTransform} ${rotateTransform};`;
}

export default class StylusCanvas extends LitElement {
  static get properties() {
    return {
      width: { type: Number },
      height: { type: Number },
      rotation: { type: Number },
      disableLowLatency: { type: Boolean },
    };
  }

  constructor() {
    super();

    // Initialize properties
    this.width = 300; // <canvas> default
    this.height = 150; // <canvas> default
    this.rotation = window.screen.orientation.angle;
    this.disableLowLatency = false;

    // Observe resizes
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize({
        width: this.clientWidth,
        height: this.clientHeight,
      });
    });
    this.resizeObserver.observe(this);

    // Observe orientation changes
    window.screen.orientation.onchange = () => {
      this.handleRotate(window.screen.orientation.angle);
    };
  }

  render() {
    const { width, height, rotation } = this;
    const canvasDims = rotateDimensions({ width, height }, rotation);
    const elDims = { width: this.clientWidth, height: this.clientHeight };
    const canvasStyleDims = rotateDimensions(elDims, rotation);

    const { disableLowLatency } = this;
    const transform = getTransform({
      ...elDims, rotation, disableLowLatency,
    });
    const style = `width: ${canvasStyleDims.width}px; height: ${canvasStyleDims.height}px; ${transform}`;

    return html`
      <style>
      :host {display: block;}
      canvas {
        touch-action: none;
        transform-origin: 50% 50%;
      }
      </style>
      <canvas width=${canvasDims.width} height=${canvasDims.height} style=${style}></canvas>
    `;
  }

  async handleResize({ width, height }) {
    this.requestUpdate();
    await this.updateComplete;
    this.dispatchEvent(new CustomEvent('canvas-resize', {
      detail: { width, height },
    }));
  }

  async handleRotate(rotation) {
    this.rotation = rotation;
    await this.updateComplete;
    this.dispatchEvent(new CustomEvent('canvas-rotate', {
      detail: {
        angle: this.rotation,
      },
    }));
  }

  // API

  getContext(contextId, optionalContextAttributes) {
    const contextAttributes = optionalContextAttributes || {};

    // Check that parameters will allow for low-latency
    if (contextAttributes.lowLatency !== true) {
      throw new Error('getContext(id, attrs) must include {lowLatency: true}');
    }

    const canvas = this.shadowRoot.querySelector('canvas');
    return canvas.getContext(contextId, contextAttributes);
  }
}

customElements.define('stylus-canvas', StylusCanvas);
