import { Universe, Cell } from "wasm-game-of-life";
import { memory } from "wasm-game-of-life/wasm_game_of_life_bg";

var FRAME_LENGTH = 10;
var CELL_SIZE = 20; //px
const ALIVE_COLOR = "#f319ff";
const DEAD_COLOR = "#0006c4";

var universe;
var canvas = document.getElementById('game-of-life-canvas');
var ctx;
var counter = 0;
var width;
var height;

//set up canvas, randomized universe
function init(){
  width = Math.floor((window.innerWidth - 100) / CELL_SIZE);
  height = Math.floor((window.innerHeight - 100) / CELL_SIZE);
  universe = Universe.new(width, height);

  canvas.height = (CELL_SIZE + 1) * height + 1;
  canvas.width = (CELL_SIZE + 1) * width + 1;
  ctx = canvas.getContext('2d');
  counter = 0;
}
init();

const fps = new class {
  constructor(){
    this.fps = document.getElementById("fps");
    this.frames = [];
    this.lastFrameTimeStamp = performance.now();
  }
  render() {
    // Convert the delta time since the last frame render into a measure
    // of frames per second.
    const now = performance.now();
    const delta = now - this.lastFrameTimeStamp;
    this.lastFrameTimeStamp = now;
    const fps = 1 / delta * 1000;

    //Save only last 100 frames
    this.frames.push(fps);
    if (this.frames.length > 100) {
      this.frames.shift();
    }

    // Find the max, min, and mean of our 100 latest timings.
    let max = -Infinity;
    let min = Infinity;
    let sum = 0;
    for (let i = 0; i < this.frames.length; i++){
      sum += this.frames[i];
      min = Math.min(this.frames[i], min);
      max = Math.max(this.frames[i], max);
    }

    let mean = sum / this.frames.length;

    //Render these stats
    this.fps.textContent = `
Frames per Second:
         latest = ${Math.round(fps)}
avg of last 100 = ${Math.round(mean)}
min of last 100 = ${Math.round(min)}
max of last 100 = ${Math.round(max)}
`.trim();
  }
};

let animationId = null;

const renderLoop = () => {
  if (counter%FRAME_LENGTH == 0) {
    universe.tick();
  }
  fps.render();
  drawCells();
  counter ++;
  animationId = requestAnimationFrame(renderLoop);
};

// Pause/play buttons/functions
const isPaused = () => {
  return animationId === null;
};

const playPauseButton = document.getElementById("play-pause");

const play = () => {
  playPauseButton.textContent = "■";
  renderLoop();
};

const pause = () => {
  playPauseButton.textContent = "▶";
  cancelAnimationFrame(animationId);
  animationId = null;
};

playPauseButton.addEventListener("click", event => {
  if (isPaused()) {
    play();
  } else {
    pause();
  }
});

// utility functions
const getIndex = (row, column) => {
  return (row * width + column);
}

const drawCells = () => {
  const cellsPtr = universe.cells();
  const cells = new Uint8Array(memory.buffer, cellsPtr, width * height);

  ctx.beginPath();

// Alive cells
  ctx.fillStyle = ALIVE_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      if (cells[idx] !== Cell.Alive) {
        continue;
      }

      ctx.fillRect(
        col * (CELL_SIZE) + 1,
        row * (CELL_SIZE) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

// Dead cells
  ctx.fillStyle = DEAD_COLOR;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const idx = getIndex(row, col);
      if (cells[idx] !== Cell.Dead) {
        continue;
      }

      ctx.fillRect(
        col * (CELL_SIZE) + 1,
        row * (CELL_SIZE) + 1,
        CELL_SIZE,
        CELL_SIZE
      );
    }
  }

  ctx.stroke();
};

// toggle cell state on click
canvas.addEventListener("click", event => {
  const boundingRect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / boundingRect.width;
  const scaleY = canvas.height / boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const row = Math.min(Math.floor(canvasTop / CELL_SIZE), height - 1);
  const col = Math.min(Math.floor(canvasLeft / CELL_SIZE), width - 1);

  if (event.metaKey){
    universe.add_glider(row, col);
  } else {
    universe.toggle_cell(row, col);
  }
  drawCells();
});

//reset canvas
const randomizer = document.getElementById("randomize");
randomizer.addEventListener("click", event => {
  init();
  drawCells();
});

//clear canvas
const clearer = document.getElementById("clear");
clearer.addEventListener("click", event => {
  universe.clear();
  drawCells();
});

//change frame length
const fSlider = document.getElementById("fslider");
fSlider.addEventListener("mouseup", event => {
  FRAME_LENGTH = fSlider.value;
});

//change cell size
const cSlider = document.getElementById("cslider");
cSlider.addEventListener("mouseup", event => {
  CELL_SIZE = cSlider.value;
  pause();
  init();
  drawCells();
});

//show and hide fps stats
const showFps = document.getElementById("showFps");
showFps.addEventListener("click", event => {
  if (fps.fps.style.display = "none") {
    fps.fps.style.display = "block";
  } else {
    fps.fps.style.display = "none";
  }
});

drawCells();
play();