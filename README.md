# stylus-canvas

This exposes the `<stylus-canvas>` web component, which allows for low-latency inking in browsers.

At this time (Nov 30), this is an experimental API in Chrome 71+. To use this in your own web app, you must sign up for an original trial token or enable chrome://flags#enable-experimental-web-platform-features.

# API

* `getContext(id: string, attrs: object)` -- get a 2d or webgl context
* `setLowLatency(enabled: boolean)` -- toggle low-latency. When updating large portions of the canvas, as when panning, tearing might occur when low-latency is enabled.
* `resize` event -- fired when canvas has been resized
* `rotate` event -- fired when canvas has been rotated to fit the 

# Additional functions

## glDrawWithBackPressure

    const ctx = document.querySelector("stylus-canvas").getContext("2d", {lowLatency: true});
    function draw() {
        glDrawWithBackPressure(ctx, () => {
            // draw here
        });
        requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);