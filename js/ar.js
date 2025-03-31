// Get the canvas from HTML
const canvas = document.getElementById("renderCanvas");
// Start Babylon.js engine
const engine = new BABYLON.Engine(canvas, true);
// Create a scene where everything happens
const scene = new BABYLON.Scene(engine);

// --- Camera Setup ---
// Add a camera and allow it to control the canvas
//adding person instraction
// const camera = new BABYLON.ArcRotateCamera(
//   "camera",
//   -Math.PI / 2,
//   Math.PI / 2.5,
//   15,
//   new BABYLON.Vector3(0, 0, 0)
// );

// i am adding wsad key controls
// you can use W in order to move forward, A to move left and S to move back and D to move right like in video game, it helps me to control me from my keyboard without use of headset which is helpful
const camera = new BABYLON.FreeCamera(
  "camera",
  new BABYLON.Vector3(0, 1.6, -2), // Start at eye level near back wall
  scene
);
camera.setTarget(new BABYLON.Vector3(0, 1.6, 0));
camera.attachControl(canvas, true);

// enable collisions
scene.collisionsEnabled = true;
camera.checkCollisions = true;
camera.applyGravity = true;
scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
camera.ellipsoid = new BABYLON.Vector3(0.5, 0.8, 0.5);
//  Restrict camera from going below the ground
// camera.upperBetaLimit = Math.PI / 2 - 0.05;
// camera.attachControl(canvas, true);
// todo not able to track while user was inside the table
// camera.setTarget(new BABYLON.Vector3(0, 1.6, 0)); //  toward center
// camera.attachControl(canvas, true);
// camera.keysUp = [87]; // W key
// camera.keysDown = [83]; // S key
// camera.keysLeft = [65]; // A key
// camera.keysRight = [68]; // D key
// camera.speed = 0.5; // Movement speed
// camera.angularSensibility = 3000;

// ENABLE COLLISION
scene.collisionsEnabled = true;
camera.checkCollisions = true;
camera.applyGravity = true;
scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
camera.ellipsoid = new BABYLON.Vector3(0.5, 0.8, 0.5);

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
floor.material.diffuseColor = new BABYLON.Color3(0.6, 0.7, 0.5);
floor.checkCollisions = true;
// floor color

// Walls (simple boxes)
const wall1 = BABYLON.MeshBuilder.CreateBox(
  "wall1",
  { width: 10, height: 3, depth: 0.1 },
  scene
);
wall1.position = new BABYLON.Vector3(0, 1.5, -5); // Back wall
wall1.material = new BABYLON.StandardMaterial("wallMat", scene);
wall1.material.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.8);
wall1.checkCollisions = true; // CHECKING COLLISION FOR WaLL 1

const wall2 = wall1.clone("wall2");
wall2.position = new BABYLON.Vector3(5, 1.5, 0);
wall2.rotation.y = Math.PI / 2; // Right wall
wall2.checkCollisions = true;

const wall3 = wall1.clone("wall3");
wall3.position = new BABYLON.Vector3(-5, 1.5, 0);
wall3.rotation.y = Math.PI / 2; // Left wall
wall3.checkCollisions = true;

const wall4 = wall1.clone("wall4");
wall4.position = new BABYLON.Vector3(0, 1.5, 5); // Front wall
wall4.checkCollisions = true;
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
ceiling.checkCollisions = true;

// --- Add directional light inside the room ---
const roomLight = new BABYLON.DirectionalLight(
  "roomLight",
  new BABYLON.Vector3(0, 1, 0), // Shining downward
  scene
);
roomLight.intensity = 0.7;
roomLight.parent = ceiling; // Light moves with ceiling

// Table (safe spot)
// Table (safe spot) - Composed of top and legs
const tableTop = BABYLON.MeshBuilder.CreateBox(
  "tableTop",
  {
    width: 2, // width
    height: 0.2, // thickness
    depth: 1.5, // depth
  },
  scene
);
tableTop.position = new BABYLON.Vector3(
  0, // x
  1.2, // height above floor
  0 // position in room
); // Raised to allow space underneath
tableTop.material = new BABYLON.StandardMaterial("tableMat", scene);
// table color
tableTop.material.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0); // Brownish
tableTop.checkCollisions = true;

const leg1 = BABYLON.MeshBuilder.CreateBox(
  "leg1",
  { width: 0.2, height: 1, depth: 0.2 },
  scene
);
// x, y, z
leg1.position = new BABYLON.Vector3(0.9, 0.7, 0.65); // Front-right
leg1.material = tableTop.material;
leg1.checkCollisions = true;

const leg2 = leg1.clone("leg2");
leg2.position = new BABYLON.Vector3(0.9, 0.7, -0.65); // Back-right
leg2.checkCollisions = true;

const leg3 = leg1.clone("leg3");
leg3.position = new BABYLON.Vector3(-0.9, 0.7, 0.65); // Front-left
leg3.checkCollisions = true;

const leg4 = leg1.clone("leg4");
leg4.position = new BABYLON.Vector3(-0.9, 0.7, -0.65); // Back-left
leg4.checkCollisions = true;

const debriefPlane = BABYLON.MeshBuilder.CreatePlane(
  "debriefPlane",
  { width: 2, height: 1 },
  scene
);

// adding defrief
debriefPlane.parent = tableTop;
debriefPlane.position.y = 1.0;
debriefPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL; // facing to the user

const debriefTexture =
  BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(debriefPlane);
const debriefText = new BABYLON.GUI.TextBlock();
debriefText.text = ""; // making it empty at first
debriefText.color = "white";
debriefText.fontSize = 40;
debriefText.textWrapping = true;
debriefTexture.addControl(debriefText);

// Hiding it initially
debriefPlane.isVisible = false;

// adding buttons
let frontText;
function button() {
  const startButtonFront = BABYLON.MeshBuilder.CreateBox(
    "startButtonFront",
    { width: 0.5, height: 0.3, depth: 0.05 },
    scene
  );
  startButtonFront.position = new BABYLON.Vector3(0, 1.5, 4.95); // Just inside front wall
  startButtonFront.material = new BABYLON.StandardMaterial("buttonMat", scene);
  startButtonFront.material.diffuseColor = new BABYLON.Color3(0, 1, 0); // Green
  startButtonFront.actionManager = new BABYLON.ActionManager(scene);
  startButtonFront.actionManager.registerAction(
    new BABYLON.ExecuteCodeAction(
      BABYLON.ActionManager.OnPickTrigger,
      startSimulation
    )
  );
  const guiTexture =
    BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
  frontText = new BABYLON.GUI.TextBlock();
  frontText.text = "Start Simulation";
  frontText.color = "white";
  frontText.fontSize = 24;
  guiTexture.addControl(frontText);
  frontText.linkWithMesh(startButtonFront);
  frontText.linkOffsetY = -50;
}
button();
// --- Earthquake Effects ---
let isEarthquake = false;
let shakeTimer;
const earthquakeSound = new BABYLON.Sound(
  "earthquake",
  "../media/earthquake.mp3",
  scene,
  () => {
    // media is not loading, don't know why
    console.log("Earthquake sound loaded successfully!", earthquakeSound);
  }, // Callback when sound is ready
  {
    autoplay: false,
    loop: false,
    volume: 1.0, // Explicit volume
    onError: (error) => {
      console.error("Error loading earthquake sound:", error); // Log any loading errors
    },
  }
);

// adding sound one more time https://doc.babylonjs.com/features/introductionToFeatures/chap2/sound/
async function initAudio() {
  const audioEngine = await BABYLON.CreateAudioEngineAsync();
  await audioEngine.unlockAsync();

  // Audio engine is ready to play sounds ...
}

// adding sou

async function startEarthquake() {
  isEarthquake = true;
  const activeCamera = scene.activeCamera; // current active camera

  // play sound while invoking this function
  // todo not ablet o get the sound
  // const sound = await BABYLON.CreateSoundAsync(
  //   "sound",
  //   "https://babylon-final-project.vercel.app/media/earthquake.mp3"
  // );
  // sound.play();

  // Hide debriefing screen at start
  debriefPlane.isVisible = false;

  if (isEarthquake) {
    frontText.text = "Drop, Cover and Hold On"; // updating the text block
    frontText.color = "red";
  }
  // todo not workings
  if (earthquakeSound.isReady()) {
    earthquakeSound.setVolume(1.0);
    earthquakeSound.play();
    console.log(
      "Earthquake sound playing... Volume:",
      earthquakeSound.getVolume()
    );
  } else {
    console.warn("Earthquake sound not ready yet!");
  }

  // Shake camera every 50ms

  shakeTimer = setInterval(() => {
    if (isEarthquake) {
      activeCamera.position.x += (Math.random() - 0.5) * 0.4; // Small random shakes
      // activeCamera.position.y += (Math.random() - 0.5) * 0.3;
      // activeCamera.position.z += (Math.random() - 0.5) * 0.2;
    }
  }, 50);

  // Flicker lights
  const originalIntensity = light.intensity;
  const flickerTimer = setInterval(() => {
    if (isEarthquake) {
      // adding sound as well

      light.intensity = originalIntensity * (0.6 + Math.random() * 0.7); // Dim and brighten
    } else {
      light.intensity = originalIntensity;
      clearInterval(flickerTimer);
    }
  }, 100);

  // Stop after 8 seconds (short for testing)
  setTimeout(() => {
    isEarthquake = false;
    frontText.text = "Start Simulation";
    frontText.color = "white";
    clearInterval(shakeTimer);
    // todo sound not workig even not loading inside the network
    earthquakeSound.stop(); // let's stop sound when earthquake is stopped
    if (activeCamera) {
      activeCamera.position = new BABYLON.Vector3(0, 1.6, -2); // Reset camera

      console.log("Camera position at end:", activeCamera.position);

      const isUnderTable = false;
      // setting it as false
      // i am not sure how to track the user current positon, i know i need x, y, and z value so that i can track if they are inside table or not but i am not sure hw to track it -> setting it to false
      debriefPlane.isVisible = true;
      if (isUnderTable) {
        debriefText.text = "You Survived! Well Done!";
        debriefText.color = "green";
      } else {
        debriefText.text = "Try Again! Get Under the Table Next Time.";
        debriefText.color = "red";
      }
    }
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

// what i am not able to do
// not able to track the user current position so that I can know if they are
