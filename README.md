# stylus-canvas

This exposes the `<stylus-canvas>` web component, which allows for low-latency inking in browsers.

# API

* `getContext(id: string, attrs: object)` -- get a 2d or webgl context; remember to pass `desynchronized: true`
* `setLowLatency(enabled: boolean)` -- toggle low-latency. When updating large portions of the canvas, as when panning, tearing might occur when low-latency is enabled.
* `canvas-resize` event -- fired when canvas has been resized `{width: number, height: number}`
* `canvas-rotate` event -- fired when canvas has been rotated to offset the display `{angle: number}`

# Additional functions

## glDrawWithBackPressure

```js
import drawWithBackPressure from "stylus-canvas/webgl/drawWithBackPressure";

const gl = document.querySelector("stylus-canvas").getContext("2d", {desynchronized: true});
function draw() {
    drawWithBackPressure(gl, () => {
        // draw here
    });
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);
```