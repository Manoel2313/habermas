const Engine = (() => {
  let canvas, ctx, W, H;
  let level = null;
  let player = null;
  const keys = {};

  function init(c) {
    canvas = c;
    ctx = canvas.getContext('2d');
    resize();
    addEventListener('resize', resize);
    addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
    addEventListener('keyup',   e => { keys[e.key.toLowerCase()] = false; });
  }

  function resize() {
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
  }

  function loadLevel(lvl) {
    level = lvl;
    player = {
      x: lvl.spawn.x,
      y: lvl.spawn.y,
      r: 14,
      speed: 3.0,
      facing: 'down'
    };
  }

  function start() { requestAnimationFrame(loop); }

  function update() {
    let dx = 0, dy = 0;
    if (keys['w'] || keys['arrowup'])    dy -= 1;
    if (keys['s'] || keys['arrowdown'])  dy += 1;
    if (keys['a'] || keys['arrowleft'])  dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;

    if (dx || dy) {
      const len = Math.hypot(dx, dy);
      player.x += (dx / len) * player.speed;
      player.y += (dy / len) * player.speed;
      if (Math.abs(dx) > Math.abs(dy)) player.facing = dx > 0 ? 'right' : 'left';
      else player.facing = dy > 0 ? 'down' : 'up';
    }

    // Colisão simples com retângulos sólidos do nível
    for (const r of level.solids) {
      const cx = Math.max(r.x, Math.min(player.x, r.x + r.w));
      const cy = Math.max(r.y, Math.min(player.y, r.y + r.h));
      const ddx = player.x - cx, ddy = player.y - cy;
      const dist = Math.hypot(ddx, ddy);
      if (dist < player.r) {
        if (dist === 0) { player.y = r.y - player.r; }
        else {
          const push = player.r - dist;
          player.x += (ddx / dist) * push;
          player.y += (ddy / dist) * push;
        }
      }
    }
  }

  function camera() {
    return {
      x: Math.max(0, Math.min(level.width  - W, player.x - W / 2)),
      y: Math.max(0, Math.min(level.height - H, player.y - H / 2))
    };
  }

  function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const cam = camera();
    level.draw(ctx, cam, player);
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  return { init, loadLevel, start, get player() { return player; } };
})();
