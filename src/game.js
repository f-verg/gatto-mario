export const WIDTH = 960;
export const HEIGHT = 540;
const GROUND = 470;
const GRAVITY = 1500;

export class Game {
  constructor() {
    this.player = { x: 100, y: GROUND - 44, width: 44, height: 44, vx: 0, vy: 0, facing: 1, lives: 3, power: null };
    this.items = [
      { type: "bread", x: 320, y: GROUND - 28, width: 28, height: 28 },
      { type: "taco", x: 560, y: GROUND - 28, width: 28, height: 28 },
      { type: "profiterole", x: 800, y: GROUND - 28, width: 28, height: 28 },
    ];
    this.enemies = [
      { type: "chicken", x: 430, y: GROUND - 36, width: 36, height: 36, vx: -80 },
      { type: "coffee", x: 680, y: GROUND - 36, width: 36, height: 36, vx: 65 },
      { type: "furry", x: 890, y: GROUND - 36, width: 36, height: 36, vx: -100 },
    ];
    this.projectiles = [];
    this.score = 0;
    this.gameOver = false;
    this.invincible = 0;
  }

  update(dt, input = {}) {
    if (this.gameOver) return;
    this.invincible = Math.max(0, this.invincible - dt);
    const player = this.player;
    player.vx = (input.left ? -220 : 0) + (input.right ? 220 : 0);
    if (player.vx) player.facing = Math.sign(player.vx);
    if (input.jump && player.y + player.height >= GROUND) player.vy = -570;
    player.vy += GRAVITY * dt;
    player.x = Math.max(0, Math.min(WIDTH - player.width, player.x + player.vx * dt));
    player.y = Math.min(GROUND - player.height, player.y + player.vy * dt);
    if (player.y + player.height >= GROUND) player.vy = 0;

    this.enemies.forEach((enemy) => {
      enemy.x += enemy.vx * dt;
      if (enemy.x < 0 || enemy.x + enemy.width > WIDTH) enemy.vx *= -1;
    });
    this.projectiles.forEach((projectile) => (projectile.x += projectile.vx * dt));
    this.projectiles = this.projectiles.filter((projectile) => projectile.x > -20 && projectile.x < WIDTH + 20);
    this.items = this.items.filter((item) => !this.collides(player, item) || !this.collect(item));
    this.enemies = this.enemies.filter((enemy) => {
      const hit = this.projectiles.some((projectile) => this.collides(projectile, enemy));
      if (hit) this.score += 100;
      return !hit;
    });
    if (!this.invincible && this.enemies.some((enemy) => this.collides(player, enemy))) this.hurt();
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

  collides(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
  }
}
