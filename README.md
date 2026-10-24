# Ovo

A standalone browser game built with HTML, CSS, and vanilla JavaScript. No build step or external dependencies are required.

## Run

Open `index.html` in a modern browser.

## Project layout

- `index.html` — page structure and canvas entry point.
- `styles/style.css` — full-screen canvas and viewport styling.
- `src/game.js` — procedural cave and decoration generation, collision map and hazards, player physics, controls, camera/rendering, and checkpoint/gate logic.

## Controls

- Arrow keys or A/D: move.
- Any other non-modifier key or desktop left-click: switch gravity.
- Touch: hold near the left or right edge to move; tap the middle to switch gravity.
- After winning, switch gravity to restart.
