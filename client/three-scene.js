let scene, camera, renderer;
let particles = [];

function initThree() {
  const container = document.getElementById('three-container');
  
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.SphereGeometry(0.1, 8, 8);
  const material = new THREE.MeshBasicMaterial({ color: 0x00aaff });

  for (let i = 0; i < 150; i++) {
    const particle = new THREE.Mesh(geometry, material);
    particle.position.x = Math.random() * 40 - 20;
    particle.position.y = Math.random() * 40 - 20;
    particle.position.z = Math.random() * 40 - 30;
    particle.userData = { velocity: Math.random() * 0.02 + 0.01 };
    scene.add(particle);
    particles.push(particle);
  }

  camera.position.z = 25;

  function animate() {
    requestAnimationFrame(animate);
    
    particles.forEach(p => {
      p.position.y += p.userData.velocity;
      if (p.position.y > 20) p.position.y = -20;
      p.rotation.x += 0.005;
      p.rotation.y += 0.005;
    });

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

initThree();