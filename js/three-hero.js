
(() => {
  const mount = document.getElementById("hero-canvas");
  if (!mount || !window.THREE || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const THREE = window.THREE;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, mount.clientWidth / mount.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({ canvas: mount, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setSize(mount.clientWidth, mount.clientHeight, false);

  const group = new THREE.Group();
  scene.add(group);

  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(2.0, 2),
    new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: .24 })
  );
  group.add(shell);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.55, .025, 12, 160),
    new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: .5 })
  );
  ring.rotation.x = .9;
  ring.rotation.y = .35;
  group.add(ring);

  const particles = new THREE.BufferGeometry();
  const count = 260;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 2.8 + Math.random() * 1.8;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    positions[i*3] = r * Math.sin(p) * Math.cos(t);
    positions[i*3+1] = r * Math.sin(p) * Math.sin(t);
    positions[i*3+2] = r * Math.cos(p);
  }
  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const points = new THREE.Points(
    particles,
    new THREE.PointsMaterial({ color: 0xc4b5fd, size: .035, transparent: true, opacity: .7 })
  );
  group.add(points);

  const mouse = { x: 0, y: 0 };
  mount.parentElement.addEventListener("pointermove", e => {
    const r = mount.parentElement.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) / r.width - .5;
    mouse.y = (e.clientY - r.top) / r.height - .5;
  }, { passive: true });

  const resize = () => {
    const w = mount.clientWidth || mount.parentElement.clientWidth;
    const h = mount.clientHeight || mount.parentElement.clientHeight;
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  window.addEventListener("resize", resize, { passive: true });
  resize();

  const clock = new THREE.Clock();
  const animate = () => {
    const t = clock.getElapsedTime();
    group.rotation.y += .0024;
    group.rotation.x = Math.sin(t * .35) * .16 + mouse.y * -.22;
    group.rotation.z = mouse.x * .15;
    shell.rotation.x += .0016;
    shell.rotation.y += .0028;
    ring.rotation.z += .0035;
    points.rotation.y -= .0012;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };
  animate();
})();
