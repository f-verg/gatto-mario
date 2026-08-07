import { Game, HEIGHT, WIDTH } from "./game.js";

const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const game = new Game();
const pressed = new Set();
let previous;

addEventListener("keydown", (event) => {
  pressed.add(event.key.toLowerCase());
  if (event.key.toLowerCase() === "x" && !event.repeat) game.shoot();
});
addEventListener("keyup", (event) => pressed.delete(event.key.toLowerCase()));

document.querySelectorAll("[data-action]").forEach((button) => {
  const { action } = button.dataset;
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    if (action === "shoot") {
      game.shoot();
    } else {
      pressed.add(action);
    }
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) =>
    button.addEventListener(eventName, () => pressed.delete(action)),
  );
});

function input() {
  return {
    left: pressed.has("arrowleft") || pressed.has("a") || pressed.has("left"),
    right: pressed.has("arrowright") || pressed.has("d") || pressed.has("right"),
    jump: pressed.has(" ") || pressed.has("arrowup") || pressed.has("w") || pressed.has("jump"),
  };
}

function rectangle(entity, color) {
  context.fillStyle = color;
  context.fillRect(entity.x, entity.y, entity.width, entity.height);
}

function draw() {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  context.fillStyle = "#8ad64b";
  context.fillRect(0, 470, WIDTH, 70);
  const playerColors = { fat: "#f5a4a4", taco: "#ef4d40", profiterole: "#71452e" };
  rectangle(game.player, playerColors[game.player.power] ?? "#f5a4a4");
  if (game.player.power === "taco") {
    context.fillStyle = "#f6d365";
    context.fillRect(game.player.x + 4, game.player.y - 8, 36, 12);
  }
  const colors = { bread: "#f4cf8b", taco: "#efb650", profiterole: "#71452e", chicken: "#fff", coffee: "#633c2a", furry: "#b875e8", bean: "#442b1d", poop: "#6c452a" };
  [...game.items, ...game.enemies, ...game.projectiles].forEach((entity) => rectangle(entity, colors[entity.type]));
  context.fillStyle = "#201633";
  context.font = "20px system-ui";
  context.fillText(`Vite: ${game.player.lives}   Punti: ${game.score}   Potere: ${game.player.power ?? "nessuno"}`, 20, 35);
  if (game.gameOver) {
    context.fillStyle = "#201633";
    context.font = "bold 48px system-ui";
    context.fillText("Game over", 360, 230);
  }
}

function frame(time) {
  if (previous !== undefined) game.update(Math.min((time - previous) / 1000, 0.05), input());
  previous = time;
  draw();
  if (!game.gameOver) requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
