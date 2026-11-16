import * as THREE from 'three';

export const Chapter1 = (() => {
  // Dimensões do escritório (em metros)
  const ROOM_W = 12;
  const ROOM_D = 10;
  const ROOM_H = 3.2;

  // Spawn: centro do escritório (onde o elevador "para")
  const spawn = { x: 0, z: 0 };
  const eyeHeight = 1.65;

  // Colisores simples (caixas) para paredes e móveis
  const solids = []; // { minX, maxX, minZ, maxZ }

  function addBox(scene, w, h, d, x, y, z, color, solid = true) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    if (solid) {
      solids.push({
        minX: x - w / 2, maxX: x + w / 2,
        minZ: z - d / 2, maxZ: z + d / 2
      });
    }
    return mesh;
  }

  function build(scene) {
    solids.length = 0;

    // Luzes
    scene.add(new THREE.AmbientLight(0x404050, 1.2));

    const ceilingLight = new THREE.PointLight(0xfff0d0, 40, 20, 2);
    ceilingLight.position.set(0, ROOM_H - 0.3, 0);
    scene.add(ceilingLight);

    const fill = new THREE.PointLight(0x88aaff, 10, 15, 2);
    fill.position.set(-3, 2.4, 3);
    scene.add(fill);

    // Chão
    const floorGeo = new THREE.PlaneGeometry(ROOM_W, ROOM_D);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1f, roughness: 1 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Teto
    const ceil = new THREE.Mesh(
      new THREE.PlaneGeometry(ROOM_W, ROOM_D),
      new THREE.MeshStandardMaterial({ color: 0x222230, roughness: 1 })
    );
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = ROOM_H;
    scene.add(ceil);

    // Paredes (4 lados)
    const wallColor = 0x2b2b33;
    addBox(scene, ROOM_W, ROOM_H, 0.3, 0, ROOM_H / 2, -ROOM_D / 2, wallColor); // norte
    addBox(scene, ROOM_W, ROOM_H, 0.3, 0, ROOM_H / 2,  ROOM_D / 2, wallColor); // sul
    addBox(scene, 0.3, ROOM_H, ROOM_D, -ROOM_W / 2, ROOM_H / 2, 0, wallColor); // oeste
    addBox(scene, 0.3, ROOM_H, ROOM_D,  ROOM_W / 2, ROOM_H / 2, 0, wallColor); // leste

    // Móveis: duas mesas e dois armários (sólidos)
    addBox(scene, 2.4, 0.75, 1.0, -3.0, 0.375, -2.5, 0x3a2a1a); // mesa 1
    addBox(scene, 2.4, 0.75, 1.0,  3.0, 0.375, -2.5, 0x3a2a1a); // mesa 2
    addBox(scene, 0.9, 1.8, 0.6, -4.6, 0.9,  2.4, 0x2a3a2a);    // armário 1
    addBox(scene, 0.9, 1.8, 0.6,  4.6, 0.9,  2.4, 0x2a3a2a);    // armário 2

    // Marcador do elevador: um disco no chão sob o spawn
    const padGeo = new THREE.CircleGeometry(1.1, 32);
    const padMat = new THREE.MeshStandardMaterial({ color: 0xffb300, emissive: 0x553300 });
    const pad = new THREE.Mesh(padGeo, padMat);
    pad.rotation.x = -Math.PI / 2;
    pad.position.y = 0.01;
    scene.add(pad);
  }

  // Resolve colisão 2D (XZ) empurrando o jogador para fora dos sólidos
  function resolveCollision(nx, nz, r) {
    let x = nx, z = nz;
    for (const s of solids) {
      const cx = Math.max(s.minX, Math.min(x, s.maxX));
      const cz = Math.max(s.minZ, Math.min(z, s.maxZ));
      const dx = x - cx, dz = z - cz;
      const dist = Math.hypot(dx, dz);
      if (dist < r) {
        if (dist === 0) { z = s.minZ - r; }
        else {
          const push = r - dist;
          x += (dx / dist) * push;
          z += (dz / dist) * push;
        }
      }
    }
    // Limites da sala (segurança extra)
    const halfW = ROOM_W / 2 - r - 0.15;
    const halfD = ROOM_D / 2 - r - 0.15;
    x = Math.max(-halfW, Math.min(halfW, x));
    z = Math.max(-halfD, Math.min(halfD, z));
    return { x, z };
  }

  return { spawn, eyeHeight, build, resolveCollision };
})();
