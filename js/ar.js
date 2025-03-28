// Get the canvas from HTML
const canvas = document.getElementById("renderCanvas");
// Start Babylon.js engine
const engine = new BABYLON.Engine(canvas, true);
// Create a scene where everything happens
const scene = new BABYLON.Scene(engine);

// --- Camera Setup ---
// Add a camera and allow it to control the canvas
const camera = new BABYLON.ArcRotateCamera(
  "camera",
  -Math.PI / 2,
  Math.PI / 2.5,
  15,
  new BABYLON.Vector3(0, 0, 0)
);
// STEP 11: Restrict camera from going below the ground
camera.upperBetaLimit = Math.PI / 2 - 0.05;
camera.attachControl(canvas, true);

// --- Lighting ---
// Simple light from above
const light = new BABYLON.HemisphericLight(
  "light",
  new BABYLON.Vector3(0, 1, 0),
  scene
);
light.intensity = 1;

// --- Build the House ---
// Floor
const floor = BABYLON.MeshBuilder.CreateGround(
  "floor",
  { width: 10, height: 10 },
  scene
);
floor.material = new BABYLON.StandardMaterial("floorMat", scene);
floor.material.diffuseColor = new BABYLON.Color3(0.6, 0.7, 0.5); // floor color

// Walls (simple boxes)
const wall1 = BABYLON.MeshBuilder.CreateBox(
  "wall1",
  { width: 10, height: 3, depth: 0.1 },
  scene
);
wall1.position = new BABYLON.Vector3(0, 1.5, -5); // Back wall
wall1.material = new BABYLON.StandardMaterial("wallMat", scene);
wall1.material.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.8);

const wall2 = wall1.clone("wall2");
wall2.position = new BABYLON.Vector3(5, 1.5, 0);
wall2.rotation.y = Math.PI / 2; // Right wall

const wall3 = wall1.clone("wall3");
wall3.position = new BABYLON.Vector3(-5, 1.5, 0);
wall3.rotation.y = Math.PI / 2; // Left wall

const wall4 = wall1.clone("wall4");
wall4.position = new BABYLON.Vector3(0, 1.5, 5); // Front wall

// ceiling
const ceiling = BABYLON.MeshBuilder.CreateBox(
  "ceiling",
  { width: 10, height: 0.1, depth: 10 },
  scene
);
ceiling.position.y = 3; // Position at top of walls
ceiling.material = wall1.material.clone("ceilingMat"); // Clone existing wall material
ceiling.material.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.85); // ceiling
ceiling.material.backFaceCulling = false; // Show both sides
ceiling.material.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0.3); // Add self-illumination
ceiling.material.specularPower = 50; // Better light reflection

// --- Add directional light inside the room ---
const roomLight = new BABYLON.DirectionalLight(
  "roomLight",
  new BABYLON.Vector3(0, 1, 0), // Shining downward
  scene
);
roomLight.intensity = 0.7;
roomLight.parent = ceiling; // Light moves with ceiling

// Table (safe spot)
const table = BABYLON.MeshBuilder.CreateBox(
  "table",
  { width: 2, height: 1, depth: 1 },
  scene
);
table.position = new BABYLON.Vector3(0, 0.5, 0);
table.material = new BABYLON.StandardMaterial("tableMat", scene);
table.material.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0); // Brownish

// --- Earthquake Effects ---
let isEarthquake = false;
let shakeTimer;
function startEarthquake() {
  isEarthquake = true;
  // Shake camera every 50ms
  shakeTimer = setInterval(() => {
    if (isEarthquake) {
      camera.position.x += (Math.random() - 0.5) * 0.3; // Small random shakes
      camera.position.y += (Math.random() - 0.5) * 0.3;
      camera.position.z += (Math.random() - 0.5) * 0.3;
    }
  }, 50);

  // Flicker lights
  const originalIntensity = light.intensity;
  const flickerTimer = setInterval(() => {
    if (isEarthquake) {
      light.intensity = originalIntensity * (0.6 + Math.random() * 0.7); // Dim and brighten
    } else {
      light.intensity = originalIntensity;
      clearInterval(flickerTimer);
    }
  }, 100);

  // Stop after 8 seconds (short for testing)
  setTimeout(() => {
    isEarthquake = false;
    clearInterval(shakeTimer);
    camera.position = new BABYLON.Vector3(0, 1.6, -5); // Reset camera
  }, 8000);
}

// --- Start the Simulation ---
function startSimulation() {
  startEarthquake();
}

// --- WebXR for VR (Meta Quest) ---
BABYLON.WebXRSessionManager.IsSessionSupportedAsync("immersive-vr").then(
  (supported) => {
    if (supported) {
      scene
        .createDefaultXRExperienceAsync({
          floorMeshes: [floor], // Define floor for VR
        })
        .then((xr) => {
          console.log("VR mode ready!"); // Test if VR works
        });
    } else {
      console.log("VR not supported, running in browser mode.");
    }
  }
);

// --- Render Loop ---
engine.runRenderLoop(() => {
  scene.render();
});

// Resize canvas when window changes
window.addEventListener("resize", () => engine.resize());

// Kick it off!
// startSimulation();
