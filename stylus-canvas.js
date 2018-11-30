// ROTATION_EPSILON is the amount to rotate the canvas when
// disabling low latency. It should be large enough to cause
// the canvas to drop out of a hw overlay, but not large enough
// to be noticeable to the user.
const ROTATION_EPSILON = 0.0001;

let tmpl = document.createElement('template');
tmpl.innerHTML = `
  <style>
    :host {display: block;}
  </style>
  <canvas></canvas>
`;

class StylusCanvas extends HTMLElement {
    constructor() {
        super();

        // Initialize properties
        this._lowLatencyEnabled = true;
        this._rotation = 0;

        // Create shadow root
        let shadowRoot = this.attachShadow({mode: "open"});
        shadowRoot.appendChild(tmpl.content.cloneNode(true));
        this.canvas = shadowRoot.querySelector("canvas");

        // Observe resizes
        this.resizeObserver = new ResizeObserver(entries => {
            for(let entry of entries) {
                const cr = entry.contentRect;
                const target = entry.target;

                this.canvas.width = cr.width;
                this.canvas.height = cr.height;
                this.canvas.style.width = `${cr.width}px`;
                this.canvas.style.height = `${cr.height}px`;
                this.dispatchEvent(new CustomEvent("resize", {
                    width: cr.width,
                    height: cr.height,
                }));
            }
        });
        this.resizeObserver.observe(this);

        // Observe orientation changes
        screen.orientation.onchange = e => {
            this._handleRotation();
        };
        this._handleRotation();
    }

    _handleRotation() {
        if(this._rotation === screen.orientation.angle) {
            return;
        }

        this._rotation = screen.orientation.angle;
        this._updateTransform();
        this.dispatchEvent(new CustomEvent("rotate", {detail: {angle: this._rotation}}));
    }
    _updateTransform() {
        let rotation = this._rotation;
        if(!this._lowLatencyEnabled) {
            // TODO Use more reliable method to disable low latency
            rotation += ROTATION_EPSILON;
        }
        this.canvas.style.transform = `rotate(${rotation}deg)`;
    }

    // API

    getContext(contextId, contextAttributes) {
        contextAttributes = contextAttributes || {};

        // Check that parameters will allow for low-latency
        if(contextAttributes["lowLatency"] !== true) {
            throw new Error("getContext(id, attrs) must include {lowLatency: true}");
        }

        return this.canvas.getContext(contextId, contextAttributes);
    }

    // setLowLatency(enabled) allows the app to programmatically toggle low 
    // latency. It may be useful to disable low latency when rendering large
    // changes, such as when panning. Otherwise tearing artifacts may be 
    // visible.
    setLowLatency(enabled) {
        if(this._lowLatencyEnabled === enabled) {
            return;
        }

        this._lowLatencyEnabled = enabled;
        this._updateTransform();
    }
}

customElements.define("stylus-canvas", StylusCanvas);

// Useful functions

// glDrawWithBackPressure will ensure that draw calls do not overload the GPU.
// Without this, the app can send too many draw calls and they will become
// more and more delayed.
let fence = null;
export function glDrawWithBackPressure(ctx, drawFn) {
    if (fence && ctx.getSyncParameter(fence, ctx.SYNC_STATUS) == ctx.UNSIGNALED) {
        return;  // Skip a frame to not overload the GL command queue.
    }
    drawFn();
    fence = ctx.fenceSync(ctx.SYNC_GPU_COMMANDS_COMPLETE, 0);  // Insert a fence.
}