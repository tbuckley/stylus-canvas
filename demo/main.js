let canvas = null;
let ctx = null;
let strokes = [];

function getPoint(e) {
    let rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
    };
}

async function main() {
    // Wait for canvas to exist
    if(!customElements.get("stylus-canvas")) {
        await customElements.whenDefined("stylus-canvas");
    }


    // Get the canvas
    canvas = document.querySelector("stylus-canvas");
    ctx = canvas.getContext("2d", {lowLatency: true});

    let strokes = [];
    let isDrawing = false;

    // Set up resize/rotate handlers
    canvas.addEventListener("resize", () => drawAllStrokes(strokes));
    canvas.addEventListener("rotate", e => {
        canvas.updateTransform2d(ctx);
        drawAllStrokes(strokes);
    });

    canvas.addEventListener("pointerdown", (e) => {
        const p = getPoint(e);
        strokes.push([p]);
        isDrawing = true;
    });
    canvas.addEventListener("pointermove", (e) => {
        if(isDrawing) {
            const p = getPoint(e);
            strokes[strokes.length-1].push(p);
            drawLatestStrokePortion(strokes);
        }
    });
    canvas.addEventListener("pointerup", () => {
        isDrawing = false;
    });
}

main();

function drawLatestStrokePortion(strokes) {
    ctx.strokeStyle = "#000";
    
    let lastStroke = strokes[strokes.length-1];
    let prev = lastStroke[lastStroke.length-2];
    let p = lastStroke[lastStroke.length-1];
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
}

function drawAllStrokes(strokes) {
    ctx.fillStyle = "red";
    ctx.fillRect(0,0,600,400);

    // Draw arrow
    ctx.strokeStyle = "#000";
    strokes.forEach(stroke => {
        ctx.beginPath();
        
        let prev = stroke[0];
        for(let i = 1; i < stroke.length; i++) {
            let p = stroke[i];
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
            prev = p;
        }
    });
}