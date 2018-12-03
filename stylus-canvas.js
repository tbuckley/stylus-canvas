// ROTATION_EPSILON is the amount to rotate the canvas when
// disabling low latency. It should be large enough to cause
// the canvas to drop out of a hw overlay, but not large enough
// to be noticeable to the user.
const ROTATION_EPSILON = 0.0001;

let tmpl = document.createElement('template');
tmpl.innerHTML = `
  <style>
    :host {display: block;}
    canvas {
        touch-action: none;
        transform-origin: 50% 50%;
    }
  </style>
  <canvas></canvas>
`;

class StylusCanvas extends HTMLElement {
    constructor() {
        super();

        // Initialize properties
        this._lowLatencyEnabled = true;
        this._rotation = 0;
        this._dimensions = {width: this.offsetWidth, height: this.offsetHeight};

        // Create shadow root
        let shadowRoot = this.attachShadow({mode: "open"});
        shadowRoot.appendChild(tmpl.content.cloneNode(true));
        this.canvas = shadowRoot.querySelector("canvas");

        // Observe resizes
        this.resizeObserver = new ResizeObserver(entries => {
            for(let entry of entries) {
                const cr = entry.contentRect;
                const target = entry.target;

                this._dimensions = {width: cr.width, height: cr.height};
                this._updateCanvasSize();
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
        this._updateCanvasSize();
        this.dispatchEvent(new CustomEvent("rotate", {detail: {angle: this._rotation}}));
    }
    _updateTransform() {
        console.log("_updateTransform");
        let rotation = this._rotation;
        if(!this._lowLatencyEnabled) {
            // TODO Use more reliable method to disable low latency
            rotation += ROTATION_EPSILON;
        }

        let shiftX = 0, shiftY = 0;
        if(this._rotation == 90 || this._rotation == 270) {
            let [width, height] = this._getCanvasWidthHeight();
            let w2 = width/2;
            let h2 = height/2;
            shiftX = h2-w2;
            shiftY = w2-h2;
        }

        let translateTransform = `translate(${shiftX}px, ${shiftY}px)`;
        let rotationTransform = `rotate(${rotation}deg)`;
        this.canvas.style.transform = translateTransform + " " + rotationTransform;
    }
    _getCanvasWidthHeight() {
        let width = this._dimensions.width;
        let height = this._dimensions.height;
        if(this._rotation == 0 || this._rotation == 180) {
            return [width, height];
        }
        return [height, width];
    }
    _updateCanvasSize() {
        let [width, height] = this._getCanvasWidthHeight();

        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
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

    updateTransform2d(ctx) {
        // Reset transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        
        // Move origin based on rotation
        let [width, height] = this._getCanvasWidthHeight();
        switch(this._rotation) {
            case 0: break;
            case 180: ctx.translate(width,height); break;
            case 90: ctx.translate(0,height); break;
            case 270: ctx.translate(width,0); break;
        }

        // Rotate context
        const angleRadians = this._rotation * Math.PI / 180;
        ctx.rotate(-angleRadians);
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