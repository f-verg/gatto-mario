export const WIDTH = 960;
export const HEIGHT = 540;
export const GROUND = 470;
const GRAVITY = 1500;

export const LEVELS = [
  {
    platforms: [
      { x: 180, y: 350, width: 150, height: 18 },
      { x: 520, y: 300, width: 160, height: 18 },
    ],
    items: [
      { type: "bread", x: 240, y: 322, width: 28, height: 28 },
      { type: "taco", x: 580, y: 272, width: 28, height: 28 },
      { type: "profiterole", x: 800, y: GROUND - 28, width: 28, height: 28 },
    ],
    enemies: [
      { type: "chicken", x: 430, y: GROUND - 36, width: 36, height: 36, vx: -80 },
      { type: "coffee", x: 680, y: GROUND - 36, width: 36, height: 36, vx: 65 },
      { type: "furry", x: 890, y: GROUND - 36, width: 36, height: 36, vx: -100 },
    ],
  },
  {
    platforms: [
      { x: 110, y: 330, width: 180, height: 18 },
      { x: 410, y: 380, width: 150, height: 18 },
      { x: 690, y: 290, width: 160, height: 18 },
    ],
    items: [
      { type: "taco", x: 180, y: 302, width: 28, height: 28 },
      { type: "profiterole", x: 760, y: 262, width: 28, height: 28 },
    ],
    enemies: [
      { type: "chicken", x: 300, y: GROUND - 36, width: 36, height: 36, vx: -110 },
      { type: "chicken", x: 520, y: GROUND - 36, width: 36, height: 36, vx: 110 },
      { type: "coffee", x: 640, y: GROUND - 36, width: 36, height: 36, vx: -95 },
      { type: "furry", x: 860, y: GROUND - 36, width: 36, height: 36, vx: -130 },
    ],
  },
  {
    platforms: [
      { x: 230, y: 360, width: 140, height: 18 },
      { x: 440, y: 280, width: 160, height: 18 },
      { x: 700, y: 360, width: 150, height: 18 },
    ],
    items: [{ type: "bread", x: 505, y: 252, width: 28, height: 28 }],
    enemies: [
      { type: "coffee", x: 220, y: GROUND - 36, width: 36, height: 36, vx: 120 },
      { type: "furry", x: 420, y: GROUND - 36, width: 36, height: 36, vx: -140 },
      { type: "furry", x: 620, y: GROUND - 36, width: 36, height: 36, vx: 140 },
      { type: "chicken", x: 800, y: GROUND - 36, width: 36, height: 36, vx: -150 },
    ],
  },
];

function cloneEntities(entities) {
  return entities.map((entity) => ({ ...entity }));
}

export class Game {
  constructor() {
    this.player = { x: 100, y: GROUND - 44, width: 44, height: 44, vx: 0, vy: 0, facing: 1, lives: 3, power: null };
    this.projectiles = [];
    this.score = 0;
    this.gameOver = false;
    this.won = false;
    this.invincible = 0;
    this.level = 0;
    this.loadLevel(this.level);
  }

  loadLevel(index) {
    const level = LEVELS[index];
    this.items = cloneEntities(level.items);
    this.platforms = cloneEntities(level.platforms);
    this.enemies = cloneEntities(level.enemies);
    this.player.x = 100;
    this.player.y = GROUND - this.player.height;
    this.player.vy = 0;
  }

  advanceLevel() {
    if (this.level + 1 < LEVELS.length) {
      this.level += 1;
      this.loadLevel(this.level);
    } else if (!this.gameOver) {
      this.gameOver = true;
      this.won = true;
    }
  }

  update(dt, input = {}) {
    if (this.gameOver) return;
    this.invincible = Math.max(0, this.invincible - dt);
    const player = this.player;
    player.vx = (input.left ? -220 : 0) + (input.right ? 220 : 0);
    if (player.vx) player.facing = Math.sign(player.vx);
    if (input.jump && this.isStanding(player)) player.vy = -570;
    const previousBottom = player.y + player.height;
    player.vy += GRAVITY * dt;
    player.x = Math.max(0, Math.min(WIDTH - player.width, player.x + player.vx * dt));
    player.y = Math.min(GROUND - player.height, player.y + player.vy * dt);
    const platform = this.platforms.find(
      (candidate) =>
        player.vy >= 0 &&
        previousBottom <= candidate.y &&
        player.y + player.height >= candidate.y &&
        player.x + player.width > candidate.x &&
        player.x < candidate.x + candidate.width
    );
    if (platform) {
      player.y = platform.y - player.height;
      player.vy = 0;
    } else if (player.y + player.height >= GROUND) {
      player.vy = 0;
    }

    this.enemies.forEach((enemy) => {
      enemy.x += enemy.vx * dt;
      if (enemy.x < 0 || enemy.x + enemy.width > WIDTH) enemy.vx *= -1;
    });
    this.projectiles.forEach((projectile) => (projectile.x += projectile.vx * dt));
    this.projectiles = this.projectiles.filter((projectile) => projectile.x > -20 && projectile.x < WIDTH + 20);
    this.items = this.items.filter((item) => !this.collides(player, item) || !this.collect(item));
    const hadEnemies = this.enemies.length > 0;
    this.enemies = this.enemies.filter((enemy) => {
      const hit = this.projectiles.some((projectile) => this.collides(projectile, enemy));
      const stomped =
        player.vy >= 0 &&
        previousBottom <= enemy.y + 10 &&
        player.y + player.height >= enemy.y &&
        player.x + player.width > enemy.x &&
        player.x < enemy.x + enemy.width;
      if (hit || stomped) {
        this.score += stomped ? 150 : 100;
        if (stomped) player.vy = -360;
      }
      return !hit && !stomped;
    });
    if (this.invincible <= 0 && this.enemies.some((enemy) => this.collides(player, enemy))) this.hurt();
    if (hadEnemies && this.enemies.length === 0 && !this.gameOver) this.advanceLevel();
  }

  collect(item) {
    if (item.type === "bread") {
      this.player.lives += 1;
      this.player.power = "fat";
    } else {
      this.player.power = item.type;
    }
    this.score += 50;
    return true;
  }

  shoot() {
    if (this.player.power !== "taco" && this.player.power !== "profiterole") return false;
    const direction = this.player.power === "profiterole" ? -this.player.facing : this.player.facing;
    this.projectiles.push({
      x: this.player.x + (direction > 0 ? this.player.width : -12),
      y: this.player.y + 20,
      width: 12,
      height: 12,
      vx: direction * 420,
      type: this.player.power === "taco" ? "bean" : "poop",
    });
    return true;
  }

  hurt() {
    this.player.lives -= 1;
    if (this.player.lives <= 0) {
      this.gameOver = true;
      return;
    }
    this.player.x = 100;
    this.player.y = GROUND - this.player.height;
    this.player.vy = 0;
    this.invincible = 1;
  }

  isStanding(player) {
    return (
      player.y + player.height >= GROUND ||
      this.platforms.some(
        (platform) =>
          player.y + player.height === platform.y &&
          player.x + player.width > platform.x &&
          player.x < platform.x + platform.width
      )
    );
  }

  collides(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }
}
