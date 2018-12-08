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
    this.rotation = 0;
    this.disableLowLatency = false;

    // Observe resizes
    this.resizeObserver = new ResizeObserver((entries) => {
      entries.forEeach((entry) => {
        const cr = entry.contentRect;
        this.handleResize(cr);
      });
    });
    this.resizeObserver.observe(this);

    // Observe orientation changes
    window.screen.orientation.onchange = () => {
      this.handleRotate(window.screen.orientation.angle);
    };
    this.handleRotate(window.screen.orientation.angle);
  }

  render(props) {
    const { width, height, rotation } = props;
    const [canvasWidth, canvasHeight] = rotateDimensions([width, height], rotation);

    const transform = getTransform(props);
    const style = `width: ${this.offsetWidth}px; height: ${this.offsetHeight}px; ${transform}`;

    return html`
      <style>
      :host {display: block;}
      canvas {
        touch-action: none;
        transform-origin: 50% 50%;
      }
      </style>
      <canvas width=${canvasWidth} height=${canvasHeight} style=${style}></canvas>
    `;
  }

  handleResize({ width, height }) {
    this.requestUpdate();
    this.updateComplete.then(() => {
      this.dispatchEvent(new CustomEvent('canvas-resize', {
        detail: { width, height },
      }));
    });
  }

  handleRotate(rotation) {
    if (this.rotation === rotation) {
      return;
    }

    this.rotation = rotation;
    this.updateComplete.then(() => {
      this.dispatchEvent(new CustomEvent('canvas-rotate', {
        detail: {
          angle: this.rotation,
        },
      }));
    });
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
