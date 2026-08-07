import test from "node:test";
import assert from "node:assert/strict";
import { Game } from "../src/game.js";

test("bread grants Mario an extra life and fat power", () => {
  const game = new Game();

  game.collect({ type: "bread" });

  assert.equal(game.player.lives, 4);
  assert.equal(game.player.power, "fat");
  assert.equal(game.score, 50);
});

test("taco shoots beans forward and profiteroles shoot backward", () => {
  const game = new Game();
  game.player.facing = 1;
  game.collect({ type: "taco" });

  assert.equal(game.shoot(), true);
  assert.equal(game.projectiles[0].type, "bean");
  assert.ok(game.projectiles[0].vx > 0);

  game.collect({ type: "profiterole" });
  game.projectiles = [];
  game.player.facing = 1;
  assert.equal(game.shoot(), true);
  assert.equal(game.projectiles[0].type, "poop");
  assert.ok(game.projectiles[0].vx < 0);
});

test("Mario loses a life on contact and ends the game without lives", () => {
  const game = new Game();

  game.hurt();
  assert.equal(game.player.lives, 2);
  assert.equal(game.gameOver, false);

  game.hurt();
  game.hurt();
  assert.equal(game.gameOver, true);
});

test("Mario is briefly invincible after enemy contact", () => {
  const game = new Game();
  game.enemies = [{ x: game.player.x, y: game.player.y, width: 36, height: 36, vx: 0 }];

  game.update(0);
  game.update(0.5);

  assert.equal(game.player.lives, 2);
  assert.ok(game.invincible > 0);
});
