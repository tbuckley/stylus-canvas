let canvas = null;
let ctx = null;

async function main() {
    // Wait for canvas to exist
    if(!customElements.get("stylus-canvas")) {
        await customElements.whenDefined("stylus-canvas");
    }

    // Get the canvas
    canvas = document.querySelector("stylus-canvas");
    ctx = canvas.getContext("2d", {lowLatency: true});
    drawStrokes();
    canvas.addEventListener("resize", drawStrokes);
    canvas.addEventListener("rotate", e => {
        // Reset transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Rotate & redraw
        const angle = e.detail.angle;
        console.log(angle);
        // ctx.rotate(-angle * Math.PI / 180);
        drawStrokes();
    })
}

main();

function drawStrokes() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.strokeStyle = "#000";
    ctx.moveTo(0,0);
    ctx.lineTo(100,100);
    ctx.stroke();
}