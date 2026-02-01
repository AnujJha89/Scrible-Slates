//I have given commments for better code readability

/*********************************
 * DOM REFERENCES
 *********************************/
const svg = document.getElementById("canvas");
const clearBtn = document.getElementById("clear");
const sizeSlider = document.getElementById("size");
const opacitySlider = document.getElementById("opacity");
document.getElementById("paletteBtn").addEventListener("click", () => {
  colorPicker.click();
});

/*********************************
 * APP STATE
 *********************************/
let tool = "pen"; // Panint bucket | pen | line | circle  | Eraser

let drawing = false;
let currentLine = null;
let tempShape = null;

let startX = 0;
let startY = 0;

/*********************************
 * PEN SETTINGS
 *********************************/
let penColor = "#000000";
let penSize = 3;
let penOpacity = 1;

/*********************************
 * UI CONTROLS
 *********************************/

// Color picker
colorPicker.addEventListener("input", (e) => {
  penColor = e.target.value;
});

// Brush size
sizeSlider.addEventListener("input", (e) => {
  penSize = Number(e.target.value);
});

// Opacity
opacitySlider.addEventListener("input", (e) => {
  penOpacity = Number(e.target.value);
});

/*********************************
 * CANVAS EVENTS
 *********************************/

// Mouse down → start drawing
svg.addEventListener("mousedown", (e) => {
   if (tool === "bucket") {
    if (e.target === svg) {
      svg.style.backgroundColor = penColor;
    } else {
      e.target.setAttribute("fill", penColor);
    }
    return;
  }

  startX = e.offsetX;
  startY = e.offsetY;

  if (tool === "pen"  ) {
    drawing = true;

    currentLine = createPolyline(startX, startY);
    svg.appendChild(currentLine);
  } else if (tool === "line") {
    tempShape = createLine(startX, startY);
    svg.appendChild(tempShape);
  } else if (tool === "circle") {
    tempShape = createCircle(startX, startY);
    svg.appendChild(tempShape);
  }
  previewDot.style.display = "none";
  svg.addEventListener("mouseleave", () => {
  previewDot.style.display = "none";
});

});

// Mouse move → update drawing
svg.addEventListener("mousemove", (e) => {
  if (tool === "pen" && drawing) {
    let points = currentLine.getAttribute("points");
    points += ` ${e.offsetX},${e.offsetY}`;
    currentLine.setAttribute("points", points);
  } else if (tool === "line" && tempShape) {
    tempShape.setAttribute("x2", e.offsetX);
    tempShape.setAttribute("y2", e.offsetY);
  } else if (tool === "circle" && tempShape) {
    const dx = e.offsetX - startX;
    const dy = e.offsetY - startY;
    tempShape.setAttribute("r", Math.sqrt(dx * dx + dy * dy));
  } else if (tool === "eraser" && e.buttons === 1) {
    const target = e.target;

    if (target !== svg) {
      target.remove();
    }
  }
});

// Mouse up → finish drawing
svg.addEventListener("mouseup", stopDrawing);
svg.addEventListener("mouseleave", stopDrawing);

/*********************************
 * ACTIONS
 *********************************/

clearBtn.addEventListener("click", () => {
  svg.innerHTML = "";
});

function stopDrawing() {
  drawing = false;
  currentLine = null;
  tempShape = null;
}

const sizePreview = document.querySelector(".size-preview");
const opacityPreview = document.querySelector(".opacity-preview");

sizeSlider.addEventListener("input", e => {
  penSize = Number(e.target.value);
  sizePreview.style.transform = `scale(${penSize / 10})`;
});

opacitySlider.addEventListener("input", e => {
  penOpacity = Number(e.target.value);
  opacityPreview.style.opacity = penOpacity;
});
let previewDot = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "circle"
);

previewDot.setAttribute("cx", 80);
previewDot.setAttribute("cy", 80);
previewDot.setAttribute("r", penSize / 2);
previewDot.setAttribute("fill", penColor);
previewDot.setAttribute("fill-opacity", penOpacity);
previewDot.setAttribute("pointer-events", "none"); // important
previewDot.style.display = "none";

svg.appendChild(previewDot);

sizeSlider.addEventListener("input", (e) => {
  penSize = Number(e.target.value);

  previewDot.setAttribute("r", penSize / 2);
  previewDot.style.display = "block";
});

colorPicker.addEventListener("input", (e) => {
  penColor = e.target.value;
  previewDot.setAttribute("fill", penColor);
});

svg.addEventListener("mousemove", (e) => {
  previewDot.setAttribute("cx", e.offsetX);
  previewDot.setAttribute("cy", e.offsetY);
});


/*********************************
 * SVG ELEMENT FACTORIES
 *********************************/

function applyStroke(element) {
  element.setAttribute("stroke", penColor);
  element.setAttribute("stroke-width", penSize);
  element.setAttribute("stroke-opacity", penOpacity);
  element.setAttribute("fill", "none");
}

function createPolyline(x, y) {
  const line = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "polyline",
  );
  applyStroke(line);
  line.setAttribute("points", `${x},${y}`);
  return line;
}

function createLine(x, y) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  applyStroke(line);
  line.setAttribute("x1", x);
  line.setAttribute("y1", y);
  line.setAttribute("x2", x);
  line.setAttribute("y2", y);
  return line;
}

function createCircle(x, y) {
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle",
  );
  applyStroke(circle);
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", 0);
  return circle;
}

/*********************************
 * TOOL SWITCHING (OPTIONAL)
 *********************************/
function setTool(newTool) {
  tool = newTool;
  stopDrawing();
  
    document.querySelectorAll(".icon-btn")
    .forEach((btn) => btn.classList.remove("active"));

  document.querySelector(`[data-tool="${newTool}"]`)?.classList.add("active");

  svg.className = newTool; // for cursor styles
}
