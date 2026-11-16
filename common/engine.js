import * as THREE from 'three';

export const Engine = (() => {
  let renderer, scene, camera;
  let level = null;
  let player = null;
  const keys = {};
  let yaw = 0, pitch = 0;
  let clock = null;

  function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);
    scene.fog = new THREE.Fog(0x0a0a0f, 8, 40);

    camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 200);

    addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
    addEventListener('keyup',   e => { keys[e.key.toLowerCase()] = false; });

    // Pointer lock para olhar com o mouse
    renderer.domElement.addEventListener('click', () => {
      renderer.domElement.requestPointerLock();
    });
    addEventListener('mousemove', e => {
      if (document.pointerLockElement !== renderer.domElement) return;
      yaw   -= e.movementX * 0.002;
      pitch -= e.movementY * 0.002;
      pitch = Math.max(-Math.PI / 2 + 0.05, Math.min(Math.PI / 2 - 0.05, pitch));
    });

    clock = new THREE.Clock();
  }

  function loadLevel(lvl) {
    level = lvl;
    level.build(scene);

    player = {
      x: lvl.spawn.x,
      y: lvl.eyeHeight,
      z: lvl.spawn.z,
      r: 0.4,
      speed: 4.5
    };
  }

  function start() {
    renderer.setAnimationLoop(loop);
  }

  function update(dt) {
    // Movimento relativo à direção da câmera
    const forward = new THREE.Vector3(-Math.sin(yaw), 0, -Math.cos(yaw));
    const right   = new THREE.Vector3(Math.cos(yaw), 0, -Math.sin(yaw));

    const move = new THREE.Vector3();
    if (keys['w'] || keys['arrowup'])    move.add(forward);
    if (keys['s'] || keys['arrowdown'])  move.sub(forward);
    if (keys['d'] || keys['arrowright']) move.add(right);
    if (keys['a'] || keys['arrowleft'])  move.sub(right);

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(player.speed * dt);
      const nx = player.x + move.x;
      const nz = player.z + move.z;
      const resolved = level.resolveCollision(nx, nz, player.r);
      player.x = resolved.x;
      player.z = resolved.z;
    }

    // Aplica posição e rotação na câmera
    camera.position.set(player.x, player.y, player.z);
    camera.rotation.order = 'YXZ';
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;
  }

  function loop() {
    const dt = Math.min(clock.getDelta(), 0.05);
    update(dt);
    renderer.render(scene, camera);
  }

  return { init, loadLevel, start };
})();
