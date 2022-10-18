// --- Basic scene & camera settings ---
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 200);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- Mouse controls for exploring ---
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// --- Setting lights ---
const keyLight = new THREE.DirectionalLight(
  new THREE.Color('hsl(30, 100%, 75%)'),
  1.0
);
keyLight.position.set(-100, 0, 100);

const fillLight = new THREE.DirectionalLight(
  new THREE.Color('hsl(240, 100%, 75%)'),
  0.75
);
fillLight.position.set(100, 0, 100);

const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
backLight.position.set(100, 0, -100).normalize();

scene.add(keyLight);
scene.add(fillLight);
scene.add(backLight);

// --- Helpers ---
const axes = new THREE.AxisHelper(500);
scene.add(axes);

// --- Models ---
const assetPath = './assets/';
const models = {
  'r2-d2': {
    model: 'r2-d2.obj',
    material: 'r2-d2.mtl',
  },
  'mustang_GT': {
    model: 'mustang_GT.obj',
    material: 'mustang_GT.mtl',
  },
  'skull': {
    model: '12140_Skull_v3_L2.obj',
    material: '12140_Skull_v3_L2.mtl'
  }
};

const modelNames = Object.keys(models);
let selectedObject = models['r2-d2'];
let lastVisibleTarget = null;

// --- GUI ---
const settings = {
  model: modelNames[0],
  modelX: 0,
  modelY: 0,
  modelZ: 0,
  newModel: function() {
    loadObject();
  },
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0
};

const gui = new dat.GUI();
gui
  .add(settings, 'model', modelNames)
  .name('Models')
  .onChange(function (value) {
    selectedObject = models[value];
    // scene.remove(lastVisibleTarget);
    // loadObject();
  });

const positionFolder = gui.addFolder('Position of the last loaded object');
positionFolder.add(settings, 'modelX', -200, 200)
  .onChange(repositionTargetObj)
  .listen();
positionFolder.add(settings, 'modelY', -200, 200)
  .onChange(repositionTargetObj)
  .listen();
positionFolder.add(settings, 'modelZ', -200, 200)
  .onChange(repositionTargetObj)
  .listen();

const rotationFolder = gui.addFolder('Rotation of the last loaded object (*PI)');
rotationFolder.add(settings, 'rotationX', 0, 2)
  .onChange(rotateTargetObj)
  .step(0.01)
  .listen();
  rotationFolder.add(settings, 'rotationY', 0, 2)
  .onChange(rotateTargetObj)
  .step(0.01)
  .listen();
  rotationFolder.add(settings, 'rotationZ', 0, 2)
  .onChange(rotateTargetObj)
  .step(0.01)
  .listen();

gui.add(settings, 'newModel').name('Load selected model');


// --- moving the object from gui ---
function repositionTargetObj() {
  lastVisibleTarget.position.x = settings.modelX;
  lastVisibleTarget.position.y = settings.modelY;
  lastVisibleTarget.position.z = settings.modelZ;
}

function rotateTargetObj() {
  lastVisibleTarget.rotation.x = settings.rotationX * Math.PI;
  lastVisibleTarget.rotation.y = settings.rotationY * Math.PI;
  lastVisibleTarget.rotation.z = settings.rotationZ * Math.PI;
}

// --- File loader settings ---
function loadObject() {
  const mtlLoader = new THREE.MTLLoader();
  mtlLoader.setTexturePath(assetPath);
  mtlLoader.setPath(assetPath);
  mtlLoader.load(selectedObject.material, function (materials) {
    materials.preload();

    const objLoader = new THREE.OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath(assetPath);
    objLoader.load(selectedObject.model, function (object) {
      scene.add(object);
      lastVisibleTarget = object;
      alignObject(object);
      settings.modelX = object.position.x;
      settings.modelY = object.position.y;
      settings.modelZ = object.position.z;
      settings.rotationX = object.rotation.x;
      settings.rotationY = object.rotation.y;
      settings.rotationZ = object.rotation.z;
    });
  });
}
// --- Obj. programatical alignment on scene ---
function alignObject(target) {
  const name = target.materialLibraries[0].split('.')[0];
  switch (name) {
    case 'r2-d2':
      {
        target.position.y -= 60;
        camera.position.z = 200;
      }
      break;
    case 'mustang_GT':
      {
        target.rotation.x = -0.5 * Math.PI;
        target.rotation.z = 0.75 * Math.PI;
        target.position.y -= 18;
        camera.position.z = 100;
      }
      break;
    case '12140_Skull_v3_L2':
      {
        target.position.set(0, -10, 0);
        target.rotation.x = 0.5 * Math.PI;
        target.rotation.y = Math.PI;
        target.rotation.z = 0.75 * Math.PI;
        camera.position.z = 50;
      } 
      break;
  }
}

// --- Animation / main ---
const animate = function () {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
};

loadObject();
animate();
