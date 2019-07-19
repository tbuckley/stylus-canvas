# stylus-canvas

This exposes the `<stylus-canvas>` web component, which allows for low-latency inking in browsers.

# API

* `getContext(id: string, attrs: object)` -- get a 2d or webgl context
* `setLowLatency(enabled: boolean)` -- toggle low-latency. When updating large portions of the canvas, as when panning, tearing might occur when low-latency is enabled.
* `resize` event -- fired when canvas has been resized
* `rotate` event -- fired when canvas has been rotated to fit the 

# Additional functions

## glDrawWithBackPressure

    import drawWithBackPressure from "@tbuckley89/stylus-canvas/drawWithBackPressure";

    const ctx = document.querySelector("stylus-canvas").getContext("2d", {desynchronized: true});
    function draw() {
        drawWithBackPressure(ctx, () => {
            // draw here
        });
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);