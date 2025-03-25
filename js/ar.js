const canvas = document.getElementById("renderCanvas");

const engine = new BABYLON.Engine(canvas, true);
// The createScene function
const createScene = async function () {
  // Create a new BABYLON scene, passing in the engine as an argument
  const scene = new BABYLON.Scene(engine);

  // Add a camera and allow it to control the canvas
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    15,
    new BABYLON.Vector3(0, 0, 0)
  );
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(1, 1, 0)
  );

  const ground = BABYLON.MeshBuilder.CreateGround("ground", {
    width: 10,
    height: 10,
  });

  const groundMat = new BABYLON.StandardMaterial("groundMat");
  groundMat.diffuseColor = new BABYLON.Color3(0.33, 0.42, 0.18);
  ground.material = groundMat;

  const box = BABYLON.MeshBuilder.CreateBox("box", {});

  box.position.y = 0.5;
  // STEP 5a: Scale the box to resemble more of a house shape
  box.scaling.x = 2;
  box.scaling.y = 1.5;
  box.scaling.z = 3;

  box.position.x = 1;
  box.position.y = 0.75;
  box.position.z = 2;

  box.rotation.y = BABYLON.Tools.ToRadians(45);

  const roof = BABYLON.MeshBuilder.CreateCylinder("roof", {
    diameter: 2.8,
    height: 3.5,
    tessellation: 3,
  });
  // STEP 8b: Scale, rotate, and position the new mesh object
  roof.scaling.x = 0.75;
  roof.rotation.z = Math.PI / 2;

  return scene;
};

// Continually render the scene in an endless loop
createScene().then((sceneToRender) => {
  engine.runRenderLoop(() => sceneToRender.render());
});

// Add an event listener that adapts to the user resizing the screen
window.addEventListener("resize", function () {
  engine.resize();
});
