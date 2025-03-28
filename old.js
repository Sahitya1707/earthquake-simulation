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
function createTextOnWall(name, position, rotation) {
  const textPlane = BABYLON.MeshBuilder.CreatePlane(
    name,
    { width: 3, height: 1 },
    scene
  );
  textPlane.position = position;
  textPlane.rotation = rotation;

  // Create dynamic texture for text
  const textTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(textPlane);

  // Create text block
  const wallText = new BABYLON.GUI.TextBlock();
  // wallText.text = "Earthquake Safety Zone";
  wallText.color = "white";
  wallText.fontSize = 150;
  wallText.outlineWidth = 4;
  wallText.outlineColor = "black";
  textTexture.addControl(wallText);

  return textPlane;
}
createTextOnWall(
  "Earthquake Safety Zone",
  new BABYLON.Vector3(0, 2, -4.95),
  new BABYLON.Vector3(0, 0, 0)
); // Back wall
createTextOnWall(
  "Earthquake Safety Zone",
  new BABYLON.Vector3(0, 1, 4.95),
  new BABYLON.Vector3(0, Math.PI, 0)
); // Front wall
createTextOnWall(
  "Earthquake Safety Zone",
  new BABYLON.Vector3(-4.95, 2, 0),
  new BABYLON.Vector3(0, -Math.PI / 2, 0)
); // Left wall
createTextOnWall(
  "Earthquake Safety Zone",
  new BABYLON.Vector3(4.95, 2, 0),
  new BABYLON.Vector3(0, Math.PI / 2, 0)
);
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
    showDebrief(); // Show debrief after
  }, 8000);
}

// --- GUI Setup ---
// Fullscreen UI for text/buttons
const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

// Instructions
const instructionText = new BABYLON.GUI.TextBlock();
instructionText.text = "Drop, Cover, and Hold On!";
instructionText.color = "white";
instructionText.fontSize = 30;
instructionText.isVisible = false;
ui.addControl(instructionText);

// function showInstructions() {
//   wallText.text = "Drop, Cover, and Hold On!";
//   wallText.color = "red";
//   // instructionText.isVisible = true;
//   // setTimeout(() => (instructionText.isVisible = false), 5000); // Show for 5 sec
// }

// Safe Spot Button
const safeButton = BABYLON.GUI.Button.CreateSimpleButton(
  "safeButton",
  "Go Under Table"
);
safeButton.width = "200px";
safeButton.height = "50px";
safeButton.color = "white";
safeButton.background = "green";
safeButton.isVisible = false;
ui.addControl(safeButton);

// safeButton.onPointerUpObservable.add(() => {
//   camera.position = new BABYLON.Vector3(0, 0.5, 0); // Move under table
//   safeButton.isVisible = false;
// });
const playButton = BABYLON.GUI.Button.CreateSimpleButton(
  "playButton",
  "START TRAINING"
);
playButton.width = "300px";
playButton.height = "80px";
playButton.color = "white";
playButton.background = "green";
playButton.fontSize = "24px";
playButton.cornerRadius = 10;
playButton.isVisible = true;
playButton.onPointerUpObservable.add(() => {
  playButton.isVisible = false; // Hide the button when clicked
  startSimulation(); // Start the earthquake simulation
});

// ui.addControl(playButton);
// Replay Button
const replayButton = BABYLON.GUI.Button.CreateSimpleButton(
  "replayButton",
  "Try Again"
);
replayButton.width = "200px";
replayButton.height = "50px";
replayButton.color = "white";
replayButton.background = "blue";
replayButton.isVisible = false;
// ui.addControl(replayButton);

replayButton.onPointerUpObservable.add(() => {
  camera.position = new BABYLON.Vector3(0, 1.6, -5); // Reset
  replayButton.isVisible = false;
  startSimulation(); // Restart
});

// Debrief Text
const debriefText = new BABYLON.GUI.TextBlock();
debriefText.text = "Good job! Stay safe next time!";
debriefText.color = "white";
debriefText.fontSize = 30;
debriefText.isVisible = false;
// ui.addControl(debriefText);

function showDebrief() {
  debriefText.isVisible = true;
  replayButton.isVisible = true;

  wallText.text = "Earthquake Safety Zone";
  wallText.color = "white";
  setTimeout(() => (debriefText.isVisible = false), 5000); // Hide after 5 sec
}

// --- Start the Simulation ---
function startSimulation() {
  startEarthquake();
  showInstructions();
  playButton.isVisible = false;
  safeButton.isVisible = true;
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
