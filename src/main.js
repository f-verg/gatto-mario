import { Game, HEIGHT, WIDTH, LEVELS, GROUND } from "./game.js";

const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const musicButton = document.querySelector("#music-toggle");
let game = new Game();
const pressed = new Set();
let previous;

const CONTROL_KEYS = new Set([
  "arrowup",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "a",
  "d",
  " ",
  "x",
]);

addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (CONTROL_KEYS.has(key)) event.preventDefault();
  pressed.add(key);
  if (key === "x" && !event.repeat) game.shoot();
  if (key === "enter" && game.gameOver) restart();
  startMusic();
});
addEventListener("keyup", (event) => pressed.delete(event.key.toLowerCase()));

document.querySelectorAll("[data-action]").forEach((button) => {
  const { action } = button.dataset;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    startMusic();
    if (action === "shoot") {
      game.shoot();
    } else {
      pressed.add(action);
    }
  });
  if (action !== "shoot") button.addEventListener("lostpointercapture", () => pressed.delete(action));
});

canvas.addEventListener("pointerdown", () => {
  startMusic();
  if (game.gameOver) restart();
});

function restart() {
  game = new Game();
}

function input() {
  return {
    left: pressed.has("arrowleft") || pressed.has("a") || pressed.has("left"),
    right: pressed.has("arrowright") || pressed.has("d") || pressed.has("right"),
    jump: pressed.has(" ") || pressed.has("arrowup") || pressed.has("w") || pressed.has("jump"),
  };
}

const PLAYER_COLORS = { fat: "#ffb3c6", taco: "#ff8a65", profiterole: "#8d6e63" };
const ITEM_COLORS = { bread: "#f4cf8b", taco: "#efb650", profiterole: "#71452e" };
const ENEMY_COLORS = { chicken: "#fff7e6", coffee: "#6f4325", furry: "#c58aef" };
const PROJECTILE_COLORS = { bean: "#442b1d", poop: "#8a5a37" };

function drawGrid() {
  context.strokeStyle = "rgba(255, 255, 255, 0.12)";
  context.lineWidth = 1;
  for (let x = 0; x <= WIDTH; x += 40) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, HEIGHT);
    context.stroke();
  }
  for (let y = 0; y <= HEIGHT; y += 40) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(WIDTH, y);
    context.stroke();
  }
}

function drawCat(entity, color) {
  const { x, y, width, height, facing = 1 } = entity;
  const cx = x + width / 2;
  const cy = y + height / 2;
  context.save();
  context.translate(cx, cy);
  context.scale(facing, 1);
  context.translate(-width / 2, -height / 2);

  context.fillStyle = color;
  context.beginPath();
  context.moveTo(width * 0.15, height * 0.05);
  context.lineTo(width * 0.35, height * 0.05);
  context.lineTo(width * 0.25, height * 0.28);
  context.closePath();
  context.fill();
  context.beginPath();
  context.moveTo(width * 0.65, height * 0.05);
  context.lineTo(width * 0.85, height * 0.05);
  context.lineTo(width * 0.75, height * 0.28);
  context.closePath();
  context.fill();

  context.beginPath();
  context.roundRect(0, height * 0.2, width, height * 0.8, height * 0.28);
  context.fill();

  context.fillStyle = "#201633";
  context.beginPath();
  context.arc(width * 0.35, height * 0.55, width * 0.06, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(width * 0.65, height * 0.55, width * 0.06, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = "#201633";
  context.lineWidth = 1.5;
  [-1, 1].forEach((side) => {
    for (let i = -1; i <= 1; i += 1) {
      context.beginPath();
      context.moveTo(width * (0.5 + side * 0.18), height * (0.72 + i * 0.04));
      context.lineTo(width * (0.5 + side * 0.45), height * (0.7 + i * 0.07));
      context.stroke();
    }
  });
  context.restore();
}

function drawBlob(entity, color, spiky = false) {
  const { x, y, width, height } = entity;
  const cx = x + width / 2;
  const cy = y + height / 2;
  const r = Math.min(width, height) / 2;
  context.fillStyle = color;
  context.beginPath();
  if (spiky) {
    const spikes = 8;
    for (let i = 0; i < spikes * 2; i += 1) {
      const angle = (Math.PI * i) / spikes;
      const radius = i % 2 === 0 ? r : r * 0.65;
      const px = cx + Math.cos(angle) * radius;
      const py = cy + Math.sin(angle) * radius;
      if (i === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.closePath();
  } else {
    context.arc(cx, cy, r, 0, Math.PI * 2);
  }
  context.fill();
  context.fillStyle = "#201633";
  context.beginPath();
  context.arc(cx - r * 0.35, cy - r * 0.1, r * 0.12, 0, Math.PI * 2);
  context.moveTo(cx + r * 0.35 + r * 0.12, cy - r * 0.1);
  context.arc(cx + r * 0.35, cy - r * 0.1, r * 0.12, 0, Math.PI * 2);
  context.fill();
}

function drawCoffee(entity) {
  const { x, y, width, height } = entity;
  context.fillStyle = "#6f4325";
  context.beginPath();
  context.roundRect(x, y + height * 0.2, width * 0.8, height * 0.8, 4);
  context.fill();
  context.strokeStyle = "#6f4325";
  context.lineWidth = 3;
  context.beginPath();
  context.arc(x + width * 0.8, y + height * 0.5, width * 0.18, -Math.PI * 0.4, Math.PI * 0.4);
  context.stroke();
  context.fillStyle = "#201633";
  context.beginPath();
  context.arc(x + width * 0.3, y + height * 0.15, width * 0.08, 0, Math.PI * 2);
  context.moveTo(x + width * 0.5 + width * 0.08, y + height * 0.15);
  context.arc(x + width * 0.5, y + height * 0.15, width * 0.08, 0, Math.PI * 2);
  context.fill();
}

function drawItem(entity) {
  const { x, y, width, height, type } = entity;
  const cx = x + width / 2;
  const cy = y + height / 2;
  context.fillStyle = ITEM_COLORS[type];
  if (type === "bread") {
    context.beginPath();
    context.ellipse(cx, cy, width / 2, height / 2, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#c98f3f";
    context.lineWidth = 1.5;
    for (let i = -1; i <= 1; i += 1) {
      context.beginPath();
      context.moveTo(x + width * 0.2, cy + i * height * 0.2);
      context.lineTo(x + width * 0.8, cy + i * height * 0.2);
      context.stroke();
    }
  } else if (type === "taco") {
    context.beginPath();
    context.arc(cx, y + height, width / 2, Math.PI, 0);
    context.fill();
    context.fillStyle = "#8ad64b";
    context.fillRect(x + 3, cy, width - 6, height * 0.2);
  } else {
    context.beginPath();
    context.arc(cx, cy, width / 2, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#4a2c1a";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x + width * 0.15, cy);
    context.quadraticCurveTo(cx, cy - height * 0.3, x + width * 0.85, cy);
    context.stroke();
  }
}

function drawProjectile(entity) {
  const { x, y, width, height, type } = entity;
  context.fillStyle = PROJECTILE_COLORS[type] ?? "#442b1d";
  context.beginPath();
  context.ellipse(x + width / 2, y + height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
  context.fill();
}

function drawEnemy(entity) {
  if (entity.type === "chicken") drawBlob(entity, ENEMY_COLORS.chicken);
  else if (entity.type === "coffee") drawCoffee(entity);
  else drawBlob(entity, ENEMY_COLORS.furry, true);
}

function draw() {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  const skyGradient = context.createLinearGradient(0, 0, 0, GROUND);
  skyGradient.addColorStop(0, "#7fd8f2");
  skyGradient.addColorStop(1, "#a6e6f5");
  context.fillStyle = skyGradient;
  context.fillRect(0, 0, WIDTH, GROUND);
  drawGrid();
  context.fillStyle = "#8ad64b";
  context.fillRect(0, GROUND, WIDTH, HEIGHT - GROUND);

  game.items.forEach(drawItem);
  game.enemies.forEach(drawEnemy);
  game.projectiles.forEach(drawProjectile);
  drawCat(game.player, PLAYER_COLORS[game.player.power] ?? "#ffb3c6");

  context.fillStyle = "#201633";
  context.font = "20px system-ui";
  context.fillText(
    `Vite: ${game.player.lives}   Punti: ${game.score}   Livello: ${game.level + 1}/${LEVELS.length}   Potere: ${game.player.power ?? "nessuno"}`,
    20,
    35
  );

  if (game.gameOver) {
    context.fillStyle = "rgba(32, 22, 51, 0.75)";
    context.fillRect(0, 0, WIDTH, HEIGHT);
    context.fillStyle = "#ffcf5c";
    context.textAlign = "center";
    context.font = "bold 56px system-ui";
    context.fillText(game.won ? "Hai vinto!" : "Game over", WIDTH / 2, HEIGHT / 2 - 10);
    context.font = "24px system-ui";
    context.fillText("Tocca lo schermo o premi Invio per ricominciare", WIDTH / 2, HEIGHT / 2 + 40);
    context.textAlign = "left";
  }
}

function frame(time) {
  if (previous !== undefined) game.update(Math.min((time - previous) / 1000, 0.05), input());
  previous = time;
  draw();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);

// --- Musica ---
let audioContext;
let musicStarted = false;

const MELODY = [
  523.25, 587.33, 659.25, 523.25, 659.25, 783.99, 659.25, 587.33,
  523.25, 659.25, 783.99, 880.0, 783.99, 659.25, 587.33, 523.25,
];
const NOTE_DURATION = 0.22;
const LOOP_DURATION = MELODY.length * NOTE_DURATION;
const SCHEDULE_AHEAD = 0.1;
let nextLoopStart = 0;
let schedulerTimer;

function scheduleMelody(startTime) {
  MELODY.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "square";
    oscillator.frequency.value = frequency;
    const noteStart = startTime + index * NOTE_DURATION;
    gain.gain.setValueAtTime(0, noteStart);
    gain.gain.linearRampToValueAtTime(0.05, noteStart + 0.02);
    gain.gain.linearRampToValueAtTime(0, noteStart + NOTE_DURATION * 0.9);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(noteStart);
    oscillator.stop(noteStart + NOTE_DURATION);
  });
}

function loopMelody() {
  if (!audioContext || audioContext.state !== "running") return;
  while (nextLoopStart < audioContext.currentTime + SCHEDULE_AHEAD) {
    scheduleMelody(nextLoopStart);
    nextLoopStart += LOOP_DURATION;
  }
  schedulerTimer = setTimeout(loopMelody, 50);
}

function startMusic() {
  if (musicStarted) return;
  musicStarted = true;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext = new AudioContextClass();
  audioContext.resume().then(() => {
    nextLoopStart = audioContext.currentTime;
    loopMelody();
  });
  updateMusicButton();
}

function updateMusicButton() {
  if (!musicButton) return;
  const playing = audioContext && audioContext.state === "running";
  musicButton.textContent = playing ? "🔊 Musica" : "🔈 Musica";
  musicButton.setAttribute("aria-pressed", String(Boolean(playing)));
}

musicButton?.addEventListener("click", () => {
  if (!musicStarted) {
    startMusic();
    return;
  }
  if (audioContext.state === "running") {
    clearTimeout(schedulerTimer);
    audioContext.suspend().then(updateMusicButton);
  } else {
    audioContext.resume().then(() => {
      nextLoopStart = Math.max(nextLoopStart, audioContext.currentTime);
      loopMelody();
      updateMusicButton();
    });
  }
});
