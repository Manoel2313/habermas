const Chapter1 = (() => {
  // Mapa: 0 = chão, 1 = parede
  const TILE = 40;
  const map = [
    "1111111111111111111111111111",
    "1000000000000000000000000001",
    "1000000000000000000000000001",
    "1000000000000000000000000001",
    "1000000000000000000000000001",
    "1000000000000000000000000001",
    "1000000000000000000000000001",
    "1000000000000000000000000001",
    "1000000000000000000000000001",
    "1000000000000000000000000001",
    "1000000000000000000000000001",
    "1000000000000000000000000001",
    "1000000000000000000000000001",
    "1000000000000000000000000001",
    "1111111111111111111111111111"
  ];

  const width  = map[0].length * TILE;
  const height = map.length    * TILE;

  // Solidos derivados do mapa
  const solids = [];
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      if (map[y][x] === '1') {
        solids.push({ x: x * TILE, y: y * TILE, w: TILE, h: TILE });
      }
    }
  }

  // Spawn: centro do mapa (é onde o elevador "para")
  const spawn = { x: width / 2, y: height / 2 };

  // Móveis do escritório (apenas visuais, sem colisão por enquanto)
  const furniture = [
    { x: width/2 - 220, y: height/2 - 140, w: 160, h: 70, type: 'desk' },
    { x: width/2 + 80,  y: height/2 - 140, w: 160, h: 70, type: 'desk' },
    { x: width/2 - 260, y: height/2 + 60,  w: 70,  h: 70, type: 'cabinet' },
    { x: width/2 + 200, y: height/2 + 60,  w: 70,  h: 70, type: 'cabinet' },
  ];

  function draw(ctx, cam, player) {
    // Chão do escritório
    ctx.fillStyle = '#1a1a1f';
    ctx.fillRect(-cam.x, -cam.y, width, height);

    // Grade sutil no chão (piso)
    ctx.strokeStyle = '#22222a';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += TILE) {
      ctx.beginPath(); ctx.moveTo(x - cam.x, -cam.y); ctx.lineTo(x - cam.x, height - cam.y); ctx.stroke();
    }
    for (let y = 0; y <= height; y += TILE) {
      ctx.beginPath(); ctx.moveTo(-cam.x, y - cam.y); ctx.lineTo(width - cam.x, y - cam.y); ctx.stroke();
    }

    // Paredes
    for (const r of solids) {
      ctx.fillStyle = '#2b2b33';
      ctx.fillRect(r.x - cam.x, r.y - cam.y, r.w, r.h);
      ctx.strokeStyle = '#3a3a44';
      ctx.strokeRect(r.x - cam.x, r.y - cam.y, r.w, r.h);
    }

    // Móveis
    for (const f of furniture) {
      if (f.type === 'desk') {
        ctx.fillStyle = '#3a2a1a';
        ctx.fillRect(f.x - cam.x, f.y - cam.y, f.w, f.h);
        ctx.fillStyle = '#5a3a2a';
        ctx.fillRect(f.x - cam.x + 6, f.y - cam.y + 6, f.w - 12, f.h - 12);
      } else if (f.type === 'cabinet') {
        ctx.fillStyle = '#2a3a2a';
        ctx.fillRect(f.x - cam.x, f.y - cam.y, f.w, f.h);
        ctx.strokeStyle = '#4a5a4a';
        ctx.strokeRect(f.x - cam.x, f.y - cam.y, f.w, f.h);
      }
    }

    // Marcador do elevador (onde o jogador "chegou")
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.arc(spawn.x - cam.x, spawn.y - cam.y, 22, 0, Math.PI * 2);
    ctx.strokeStyle = '#ffb300';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Jogador (Gordon, sem traje — só uma figura simples)
    const px = player.x - cam.x;
    const py = player.y - cam.y;
    ctx.fillStyle = '#d8d8d8'; // jaleco/roupa clara
    ctx.beginPath(); ctx.arc(px, py, player.r, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(px, py, player.r, 0, Math.PI * 2); ctx.stroke();

    // Indicador de direção
    const dirs = { up: [0,-1], down: [0,1], left: [-1,0], right: [1,0] };
    const [fx, fy] = dirs[player.facing] || [0,1];
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(px + fx * (player.r - 4), py + fy * (player.r - 4), 3, 0, Math.PI * 2);
    ctx.fill();
  }

  return { width, height, solids, spawn, draw };
})();
