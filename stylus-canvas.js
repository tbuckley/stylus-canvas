import {LitElement, html} from "@polymer/lit-element";

// ROTATION_EPSILON is the amount to rotate the canvas when
// disabling low latency. It should be large enough to cause
// the canvas to drop out of a hw overlay, but not large enough
// to be noticeable to the user.
const ROTATION_EPSILON = 0.0001;

class StylusCanvas extends LitElement {
    constructor() {
        this.lowLatencyEnabled = true;
        this.rotation = 0;
    }

    render() {
        return html`<canvas></canvas>`;
    }

    firstUpdated() {
        this.canvas = this.shadowRoot.querySelector("canvas");

        // Observe resizes
        this.resizeObserver = new ResizeObserver(entries => {
            for(let entry of entries) {
                const cr = entry.contentRect;
                const target = entry.target;

                this.canvas.style.width = `${cr.width}px`;
                this.canvas.style.height = `${cr.height}px`;
            }
        });
        this.resizeObserver.observe(this);

        // Observe orientation changes
        window.addEventListener("orientationchange", e => {
            this.rotation = screen.orientation.angle;
            this.dispatchEvent("rotate", {angle: this.rotation});
        });
        this._handleRotation();
    }

    _handleRotation() {
        if(this.rotation == screen.orientation.angle) {
            return;
        }

        this.rotation = screen.orientation.angle;
        this._updateTransform();
        this.dispatchEvent("rotate", {angle: this.rotation});
    }
    _updateTransform() {
        let rotation = this.rotation;
        if(!this.lowLatencyEnabled) {
            rotation += ROTATION_EPSILON;
        }
        this.canvas.style.transform = `rotate(${rotation}deg)`;
    }

    // API

    getContext(contextId, contextAttributes) {
        return this.canvas.getContext(contextId, contextAttributes);
    }

    // setLowLatency(enabled) allows the app to programmatically toggle low 
    // latency. It may be useful to disable low latency when rendering large
    // changes, such as when panning. Otherwise tearing artifacts may be 
    // visible.
    setLowLatency(enabled) {
        // TODO Use more reliable method to disable low latency
        this.lowLatencyEnabled = true;
        this._updateTransform();
    }
}

customElements.define("stylus-canvas", StylusCanvas);