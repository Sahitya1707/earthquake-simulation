// Get the canvas from HTML
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

let earthquakeSound;
let audioEngine;
let plantMesh;
let importedTable;

// Camera
const camera = new BABYLON.FreeCamera(
  "camera",
  new BABYLON.Vector3(0, 1.6, -2),
  scene
);
camera.setTarget(new BABYLON.Vector3(0, 1.6, 0));
camera.attachControl(canvas, true);
scene.collisionsEnabled = true;
camera.checkCollisions = true;
camera.applyGravity = true;
scene.gravity = new BABYLON.Vector3(0, -0.9, 0);
camera.ellipsoid = new BABYLON.Vector3(0.5, 0.8, 0.5);

// Light
const light = new BABYLON.HemisphericLight(
  "light",
  new BABYLON.Vector3(0, 1, 0),
  scene
);
light.intensity = 1;

// Floor
const floor = BABYLON.MeshBuilder.CreateGround(
  "floor",
  { width: 10, height: 10 },
  scene
);
floor.material = new BABYLON.StandardMaterial("floorMat", scene);
floor.material.diffuseColor = new BABYLON.Color3(0.6, 0.7, 0.5);
floor.checkCollisions = true;
floor.receiveShadows = true;

// Walls
const wallMaterial = new BABYLON.StandardMaterial("wallMat", scene);
wallMaterial.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.8);
function createWall(name, position, rotationY = 0) {
  const wall = BABYLON.MeshBuilder.CreateBox(
    name,
    { width: 10, height: 3, depth: 0.1 },
    scene
  );
  wall.position = position;
  wall.rotation.y = rotationY;
  wall.material = wallMaterial;
  wall.checkCollisions = true;
  return wall;
}
createWall("wall1", new BABYLON.Vector3(0, 1.5, -5));
createWall("wall2", new BABYLON.Vector3(5, 1.5, 0), Math.PI / 2);
createWall("wall3", new BABYLON.Vector3(-5, 1.5, 0), Math.PI / 2);
createWall("wall4", new BABYLON.Vector3(0, 1.5, 5));

// Ceiling
const ceiling = BABYLON.MeshBuilder.CreateBox(
  "ceiling",
  { width: 10, height: 0.1, depth: 10 },
  scene
);
ceiling.position.y = 3;
ceiling.material = wallMaterial.clone("ceilingMat");
ceiling.material.diffuseColor = new BABYLON.Color3(0.85, 0.85, 0.85);
ceiling.material.backFaceCulling = false;
ceiling.material.emissiveColor = new BABYLON.Color3(0.3, 0.1, 0.3);
ceiling.material.specularPower = 50;
ceiling.checkCollisions = true;

// Directional Light and Shadow
const roomLight = new BABYLON.DirectionalLight(
  "roomLight",
  new BABYLON.Vector3(-1, -2, -1),
  scene
);
roomLight.position = new BABYLON.Vector3(5, 5, -5);
roomLight.intensity = 0.7;
roomLight.parent = ceiling;

const shadowGenerator = new BABYLON.ShadowGenerator(1024, roomLight);
shadowGenerator.useBlurExponentialShadowMap = false;
shadowGenerator.useExponentialShadowMap = false;
shadowGenerator.usePoissonSampling = false;
shadowGenerator.setDarkness(0.8);

// Table
BABYLON.SceneLoader.Append("/models/", "table.glb", scene, function (scene) {
  importedTable = scene.meshes[scene.meshes.length - 1];
  importedTable.position = new BABYLON.Vector3(0, 1, 0.5);
  importedTable.scaling = new BABYLON.Vector3(3, 2, 3);
  importedTable.checkCollisions = true;
  importedTable.name = "importedTable";
  shadowGenerator.addShadowCaster(importedTable, true);
  importedTable.receiveShadows = true;
  console.log("GLB table model loaded successfully!");
});

// Plant
BABYLON.SceneLoader.ImportMeshAsync("", "/models/", "plant.glb", scene).then(
  (result) => {
    plantMesh = result.meshes[0];
    plantMesh.position = new BABYLON.Vector3(-0.6, 1.9, 0.5);
    plantMesh.scaling = new BABYLON.Vector3(0.6, 0.6, 0.6);
    plantMesh.receiveShadows = false;
  }
);

// Debrief Panel
const debriefPlane = BABYLON.MeshBuilder.CreatePlane(
  "debriefPlane",
  { width: 2, height: 1 },
  scene
);
debriefPlane.position = new BABYLON.Vector3(0, 2, 0);
debriefPlane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
const debriefTexture =
  BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(debriefPlane);
const debriefText = new BABYLON.GUI.TextBlock();
debriefText.text = "";
debriefText.color = "white";
debriefText.fontSize = 40;
debriefText.textWrapping = true;
debriefTexture.addControl(debriefText);
debriefPlane.isVisible = false;

// Start Button
let frontText;
function button() {
  const startButtonFront = BABYLON.MeshBuilder.CreateBox(
    "startButtonFront",
    { width: 0.5, height: 0.3, depth: 0.05 },
    scene
  );
  startButtonFront.position = new BABYLON.Vector3(0, 1.5, 4.95);
  startButtonFront.material = new BABYLON.StandardMaterial("buttonMat", scene);
  startButtonFront.material.diffuseColor = new BABYLON.Color3(0, 1, 0);
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

// Audio
(async () => {
  audioEngine = await BABYLON.CreateAudioEngineAsync();
  earthquakeSound = await BABYLON.CreateSoundAsync(
    "earthquake",
    "/media/earthquake.mp3",
    scene
  );
  await audioEngine.unlockAsync();
  console.log("Audio engine unlocked & earthquake sound ready.");
})();

// Earthquake Logic
function startEarthquake() {
  isEarthquake = true;
  const activeCamera = scene.activeCamera;
  debriefPlane.isVisible = false;

  if (!audioEngine.unlocked) audioEngine.unlockAsync();
  if (earthquakeSound) earthquakeSound.play();
  frontText.text = "Drop, Cover and Hold On";
  frontText.color = "red";

  shakeTimer = setInterval(() => {
    if (isEarthquake) {
      activeCamera.position.x += (Math.random() - 0.5) * 0.4;
      activeCamera.position.y += (Math.random() - 0.5) * 0.2;
      activeCamera.position.z += (Math.random() - 0.5) * 0.4;

      if (importedTable) {
        importedTable.position.x += (Math.random() - 0.5) * 0.1;
        importedTable.position.z += (Math.random() - 0.5) * 0.1;
      }

      if (plantMesh) {
        plantMesh.rotation.x += (Math.random() - 0.5) * 0.05;
        plantMesh.rotation.z += (Math.random() - 0.5) * 0.05;
      }
    }
  }, 50);

  const originalIntensity = light.intensity;
  const flickerTimer = setInterval(() => {
    light.intensity = isEarthquake
      ? originalIntensity * (0.6 + Math.random() * 0.7)
      : originalIntensity;
    if (!isEarthquake) clearInterval(flickerTimer);
  }, 100);

  setTimeout(() => {
    isEarthquake = false;
    clearInterval(shakeTimer);
    earthquakeSound.stop();
    activeCamera.position = new BABYLON.Vector3(0, 1.6, -2);
    frontText.text = "Start Simulation";
    frontText.color = "white";
    debriefPlane.isVisible = true;
    debriefText.text = "Try Again! Get Under the Table Next Time.";
    debriefText.color = "red";
  }, 8000);
}

function startSimulation() {
  startEarthquake();
}

BABYLON.WebXRSessionManager.IsSessionSupportedAsync("immersive-vr").then(
  (supported) => {
    if (supported) {
      scene
        .createDefaultXRExperienceAsync({ floorMeshes: [floor] })
        .then(() => console.log("VR mode ready!"));
    } else {
      console.log("VR not supported, running in browser mode.");
    }
  }
);

engine.runRenderLoop(() => {
  scene.render();
});

window.addEventListener("resize", () => engine.resize());
