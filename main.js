import * as THREE from "https://cdn.skypack.dev/three@0.160.0";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.160.0/examples/jsm/loaders/RGBELoader.js";

const app = document.getElementById("app");

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffcfd6);

const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 50);
camera.position.set(0, 0.35, 4.6);
camera.lookAt(0, 0.2, 0);

const pmrem = new THREE.PMREMGenerator(renderer);
pmrem.compileEquirectangularShader();

const hemiLight = new THREE.HemisphereLight(0xfff1d0, 0xff748f, 0.75);
hemiLight.position.set(0, 1, 0);
scene.add(hemiLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 1.1);
rimLight.position.set(-3, 3, 5);
rimLight.castShadow = false;
scene.add(rimLight);

const fillLight = new THREE.SpotLight(0xff8fa7, 1.2, 15, Math.PI / 5, 0.45, 1);
fillLight.position.set(3, 2.5, 4);
fillLight.target.position.set(0, 0.4, 0);
scene.add(fillLight.target);
scene.add(fillLight);

const groundLight = new THREE.DirectionalLight(0xfff7f2, 0.6);
groundLight.position.set(0, -2, 3);
scene.add(groundLight);

const tomatoGroup = createTomato();
scene.add(tomatoGroup);

const handGroup = createHandWithFork();
scene.add(handGroup);

let envMap = null;
new RGBELoader()
  .setDataType(THREE.HalfFloatType)
  .load("https://storage.googleapis.com/learnjs-data/agent-env/studio_small_09_1k.hdr", (hdr) => {
    envMap = pmrem.fromEquirectangular(hdr).texture;
    scene.environment = envMap;
    hdr.dispose();
  });

const clock = new THREE.Clock();
let chewingStart = null;

function animate() {
  requestAnimationFrame(animate);

  const elapsed = clock.getElapsedTime();
  updateTomato(elapsed);
  updateHand(elapsed);

  renderer.render(scene, camera);
}

animate();

function createTomato() {
  const group = new THREE.Group();
  group.position.set(0, 0.1, 0);

  const tomatoGeometry = new THREE.SphereGeometry(1, 160, 160);
  tomatoGeometry.scale(1, 0.98, 1);
  tomatoGeometry.translate(0, 0.03, 0);

  const tomatoMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xdd1f2c,
    roughness: 0.16,
    metalness: 0.05,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    sheen: 1,
    sheenColor: new THREE.Color(0xff6b6b),
    sheenRoughness: 0.35,
    transmission: 0.07,
    thickness: 0.48,
    ior: 1.45,
    specularIntensity: 1,
    specularColor: new THREE.Color(0xffffff),
  });

  const tomatoMesh = new THREE.Mesh(tomatoGeometry, tomatoMaterial);
  tomatoMesh.castShadow = false;
  tomatoMesh.receiveShadow = false;
  group.add(tomatoMesh);

  const blushMaterial = new THREE.MeshStandardMaterial({
    color: 0xff8a9a,
    emissive: 0xff4e6d,
    emissiveIntensity: 0.1,
    transparent: true,
    opacity: 0.18,
  });

  const blushGeometry = new THREE.SphereGeometry(0.32, 48, 48);
  const blushLeft = new THREE.Mesh(blushGeometry, blushMaterial);
  blushLeft.position.set(-0.43, -0.08, 0.88);
  blushLeft.scale.set(1, 0.65, 0.35);
  group.add(blushLeft);

  const blushRight = blushLeft.clone();
  blushRight.position.x *= -1;
  group.add(blushRight);

  const face = createFace();
  group.add(face);

  const stem = createStem();
  group.add(stem);

  const subtleBounce = new THREE.Mesh(
    new THREE.CircleGeometry(1.15, 64),
    new THREE.MeshBasicMaterial({ color: 0xeb8591, transparent: true, opacity: 0.35 })
  );
  subtleBounce.rotation.x = -Math.PI / 2;
  subtleBounce.position.y = -1.02;
  subtleBounce.scale.set(0.8, 0.8, 0.8);
  group.add(subtleBounce);

  group.userData = {
    tomatoMesh,
    face,
    blushLeft,
    blushRight,
  };

  return group;
}

function createFace() {
  const face = new THREE.Group();
  face.position.set(0, 0.05, 0.86);

  const eyeWhiteMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.1,
    metalness: 0,
    clearcoat: 0.6,
    clearcoatRoughness: 0.3,
  });

  const pupilMaterial = new THREE.MeshStandardMaterial({
    color: 0x331616,
    metalness: 0.1,
    roughness: 0.25,
  });

  const irisMaterial = new THREE.MeshStandardMaterial({
    color: 0x4b7ad1,
    emissive: 0x1b396f,
    emissiveIntensity: 0.45,
    metalness: 0.15,
    roughness: 0.25,
  });

  const eyeGeometry = new THREE.SphereGeometry(0.16, 64, 64);
  eyeGeometry.scale(1, 1, 0.65);

  const leftEye = new THREE.Mesh(eyeGeometry, eyeWhiteMaterial);
  leftEye.position.set(-0.32, 0.2, 0.04);
  face.add(leftEye);

  const rightEye = leftEye.clone();
  rightEye.position.x *= -1;
  face.add(rightEye);

  const irisGeometry = new THREE.CircleGeometry(0.09, 48);
  const leftIris = new THREE.Mesh(irisGeometry, irisMaterial);
  leftIris.position.set(-0.32, 0.18, 0.12);
  leftIris.rotation.x = -Math.PI / 2.1;
  face.add(leftIris);

  const rightIris = leftIris.clone();
  rightIris.position.x *= -1;
  face.add(rightIris);

  const pupilGeometry = new THREE.CircleGeometry(0.05, 48);
  const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
  leftPupil.position.copy(leftIris.position);
  leftPupil.position.z += 0.015;
  leftPupil.rotation.copy(leftIris.rotation);
  face.add(leftPupil);

  const rightPupil = leftPupil.clone();
  rightPupil.position.copy(rightIris.position);
  face.add(rightPupil);

  const eyeHighlightMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
  });
  const highlightGeometry = new THREE.CircleGeometry(0.018, 24);
  const leftHighlight = new THREE.Mesh(highlightGeometry, eyeHighlightMaterial);
  leftHighlight.position.copy(leftIris.position);
  leftHighlight.position.x -= 0.03;
  leftHighlight.position.y += 0.03;
  leftHighlight.position.z += 0.03;
  face.add(leftHighlight);

  const rightHighlight = leftHighlight.clone();
  rightHighlight.position.x *= -1;
  face.add(rightHighlight);

  const noseGeometry = new THREE.SphereGeometry(0.08, 32, 32);
  noseGeometry.scale(1, 1, 0.6);
  const noseMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff7a85,
    roughness: 0.4,
    metalness: 0.05,
    clearcoat: 0.4,
  });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(0, -0.02, 0.14);
  nose.rotation.x = -0.35;
  face.add(nose);

  const lipMaterial = new THREE.MeshStandardMaterial({
    color: 0xb21529,
    metalness: 0.2,
    roughness: 0.35,
    emissive: 0x401018,
    emissiveIntensity: 0.2,
  });

  const lipGeometry = new THREE.TorusGeometry(0.32, 0.055, 42, 128, Math.PI * 2);
  const lips = new THREE.Mesh(lipGeometry, lipMaterial);
  lips.rotation.x = Math.PI / 2;
  lips.position.set(0, -0.18, 0.04);
  face.add(lips);

  const innerMouth = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.35, 0.35, 64, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x120607,
      side: THREE.DoubleSide,
      roughness: 0.4,
      metalness: 0.1,
    })
  );
  innerMouth.position.set(0, -0.18, 0.22);
  innerMouth.rotation.x = Math.PI / 2;
  face.add(innerMouth);

  const tongue = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 42, 42, 0, Math.PI),
    new THREE.MeshStandardMaterial({
      color: 0xff6177,
      roughness: 0.5,
      metalness: 0.2,
      emissive: 0xa64d66,
      emissiveIntensity: 0.35,
    })
  );
  tongue.position.set(0, -0.26, 0.23);
  tongue.scale.set(1.1, 0.65, 1.2);
  face.add(tongue);

  const teethGeometry = new THREE.BoxGeometry(0.35, 0.08, 0.03);
  const teethMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.15,
    metalness: 0.05,
  });
  const teeth = new THREE.Mesh(teethGeometry, teethMaterial);
  teeth.position.set(0, -0.14, 0.23);
  face.add(teeth);

  const smileLiftLeft = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 24, 24, 0, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xff4c60, transparent: true, opacity: 0.25 })
  );
  smileLiftLeft.position.set(-0.33, -0.18, 0.18);
  smileLiftLeft.rotation.x = Math.PI / 2.5;
  face.add(smileLiftLeft);

  const smileLiftRight = smileLiftLeft.clone();
  smileLiftRight.position.x *= -1;
  face.add(smileLiftRight);

  face.userData = {
    innerMouth,
    tongue,
    lips,
    teeth,
    smileLiftLeft,
    smileLiftRight,
  };

  return face;
}

function createStem() {
  const stemGroup = new THREE.Group();
  stemGroup.position.set(0, 1.01, -0.08);
  stemGroup.rotation.x = -0.15;

  const stalk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.15, 0.55, 18),
    new THREE.MeshPhysicalMaterial({
      color: 0x2b5a14,
      roughness: 0.4,
      metalness: 0.1,
      clearcoat: 0.2,
      sheen: 0.4,
      sheenColor: new THREE.Color(0x5fa437),
    })
  );
  stalk.position.y = 0.24;
  stemGroup.add(stalk);

  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x3f8f25,
    roughness: 0.5,
    metalness: 0.1,
    side: THREE.DoubleSide,
  });

  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.quadraticCurveTo(0.35, 0.1, 0.9, 0);
  leafShape.quadraticCurveTo(0.35, -0.12, 0, 0);

  const leafGeometry = new THREE.ExtrudeGeometry(leafShape, {
    steps: 2,
    depth: 0.06,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelThickness: 0.01,
    bevelSize: 0.025,
  });
  leafGeometry.center();

  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    leaf.scale.set(0.9, 0.9, 0.9);
    leaf.rotation.y = (Math.PI * 2 * i) / 6;
    leaf.rotation.x = 0.8;
    leaf.position.set(0, -0.05, -0.02);
    stemGroup.add(leaf);
  }

  return stemGroup;
}

function createHandWithFork() {
  const group = new THREE.Group();
  group.position.set(-2.4, -0.1, 0.55);
  group.rotation.set(0.08, -0.4, -0.25);

  const skinMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffc9a5,
    roughness: 0.6,
    metalness: 0.05,
    clearcoat: 0.1,
    sheen: 0.15,
    sheenColor: new THREE.Color(0xffe2c9),
  });

  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.18, 0.4), skinMaterial);
  palm.position.set(0, 0, 0);
  palm.rotation.z = Math.PI / 48;
  group.add(palm);

  const fingerGeometry = new THREE.BoxGeometry(0.48, 0.08, 0.16);
  const fingerOffsets = [-0.1, 0.05, 0.18];
  fingerOffsets.forEach((offset, index) => {
    const finger = new THREE.Mesh(fingerGeometry, skinMaterial);
    finger.position.set(0.34, offset, 0.12 - index * 0.08);
    finger.scale.z = 0.6 + index * 0.1;
    finger.rotation.y = -0.2 + index * 0.08;
    group.add(finger);
  });

  const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.09, 0.14), skinMaterial);
  thumb.position.set(-0.22, -0.1, 0.2);
  thumb.rotation.set(0.35, 0.35, -0.5);
  group.add(thumb);

  const forkGroup = new THREE.Group();
  forkGroup.position.set(0.46, 0.01, 0.02);
  forkGroup.rotation.set(0, 0.28, 0.05);
  group.add(forkGroup);

  const forkHandle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.045, 1.45, 24),
    new THREE.MeshPhysicalMaterial({
      color: 0xd5d8e1,
      roughness: 0.15,
      metalness: 0.9,
      envMapIntensity: 1.5,
    })
  );
  forkHandle.rotation.z = Math.PI / 2;
  forkGroup.add(forkHandle);

  const forkHead = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.08, 0.14),
    new THREE.MeshPhysicalMaterial({
      color: 0xe6e7ef,
      metalness: 0.95,
      roughness: 0.12,
    })
  );
  forkHead.position.set(0.74, 0, 0);
  forkGroup.add(forkHead);

  const prongMaterial = forkHead.material;
  for (let i = 0; i < 4; i++) {
    const prong = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.025, 0.04), prongMaterial);
    prong.position.set(0.9, 0.038 - i * 0.026, 0.05 - i * 0.03);
    forkGroup.add(prong);
  }

  const slice = createTomatoSlice();
  slice.position.set(0.95, 0, 0);
  slice.rotation.set(0, 0.2, 0);
  forkGroup.add(slice);

  group.userData = {
    startPosition: group.position.clone(),
    targetPosition: new THREE.Vector3(-0.3, -0.05, 0.32),
    slice,
    forkGroup,
  };

  return group;
}

function createTomatoSlice() {
  const sliceGroup = new THREE.Group();

  const outerMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xe32230,
    roughness: 0.25,
    metalness: 0.1,
    clearcoat: 0.8,
    clearcoatRoughness: 0.08,
    sheen: 0.6,
    sheenColor: new THREE.Color(0xff6f7a),
  });

  const fleshMaterial = new THREE.MeshStandardMaterial({
    color: 0xff6a7a,
    roughness: 0.55,
    metalness: 0.05,
    emissive: 0xff3246,
    emissiveIntensity: 0.2,
  });

  const edgeGeometry = new THREE.CylinderGeometry(0.21, 0.21, 0.05, 64);
  const outerEdge = new THREE.Mesh(edgeGeometry, outerMaterial);
  outerEdge.rotation.x = Math.PI / 2;
  sliceGroup.add(outerEdge);

  const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.045, 64), fleshMaterial);
  inner.rotation.x = Math.PI / 2;
  sliceGroup.add(inner);

  const seedMaterial = new THREE.MeshStandardMaterial({
    color: 0xffd9a1,
    roughness: 0.3,
    metalness: 0.15,
  });

  for (let i = 0; i < 6; i++) {
    const seed = new THREE.Mesh(new THREE.SphereGeometry(0.02, 16, 16), seedMaterial);
    const angle = (i / 6) * Math.PI * 2;
    seed.position.set(Math.cos(angle) * 0.09, Math.sin(angle) * 0.01, Math.sin(angle) * 0.09);
    seed.rotation.x = Math.PI / 2;
    sliceGroup.add(seed);
  }

  sliceGroup.scale.set(0.85, 0.85, 0.5);

  return sliceGroup;
}

function updateTomato(elapsed) {
  const bob = Math.sin(elapsed * 1.5) * 0.02;
  tomatoGroup.position.y = 0.12 + bob;
  tomatoGroup.rotation.y = Math.sin(elapsed * 0.8) * 0.05;

  const face = tomatoGroup.userData.face;
  const { innerMouth, tongue, lips, teeth, smileLiftLeft, smileLiftRight } = face.userData;

  if (elapsed >= 2 && elapsed <= 5) {
    if (!chewingStart) chewingStart = elapsed;
    const chewElapsed = elapsed - chewingStart;
    const chewWave = Math.sin(chewElapsed * 3.2) * 0.35;
    innerMouth.scale.y = 1 + chewWave * 0.35;
    innerMouth.scale.z = 1 + chewWave * 0.3;

    tongue.position.y = -0.26 + Math.max(chewWave * 0.08, -0.04);
    tongue.rotation.x = -chewWave * 0.3;

    lips.scale.y = 1 + chewWave * 0.15;
    lips.rotation.z = chewWave * 0.08;

    teeth.position.y = -0.14 + chewWave * 0.06;

    smileLiftLeft.position.y = -0.18 + chewWave * 0.04;
    smileLiftRight.position.y = smileLiftLeft.position.y;
    smileLiftLeft.rotation.z = 0.45 + chewWave * 0.2;
    smileLiftRight.rotation.z = -smileLiftLeft.rotation.z;
  } else {
    face.userData.innerMouth.scale.set(1, 1, 1);
    face.userData.tongue.position.y = -0.26;
    face.userData.lips.scale.set(1, 1, 1);
    face.userData.lips.rotation.z = 0;
    face.userData.teeth.position.y = -0.14;
    face.userData.smileLiftLeft.position.y = -0.18;
    face.userData.smileLiftRight.position.y = -0.18;
  }

  face.rotation.y = Math.sin(elapsed * 0.5) * 0.02;
  face.position.z = 0.86 + Math.sin(elapsed * 0.8) * 0.01;
}

function updateHand(elapsed) {
  const { startPosition, targetPosition, slice, forkGroup } = handGroup.userData;
  const handProgress = Math.min(elapsed / 2, 1);
  const eased = easeOutCubic(handProgress);

  handGroup.position.lerpVectors(startPosition, targetPosition, eased);
  handGroup.rotation.y = -0.4 + eased * 0.45;
  handGroup.rotation.x = 0.08 - eased * 0.22;
  handGroup.rotation.z = -0.25 + eased * 0.18;

  forkGroup.rotation.x = 0.25 + eased * 0.4;
  forkGroup.rotation.y = 0.28 - eased * 0.35;

  if (elapsed < 2) {
    slice.position.set(0.95, 0, 0);
    slice.rotation.y = 0.2 + Math.sin(elapsed * 2.5) * 0.25;
  } else {
    const chewElapsed = Math.min(elapsed - 2, 3);
    slice.position.set(0.65 - chewElapsed * 0.35, 0, -0.12);
    slice.rotation.set(0.6, 0.2, Math.sin(chewElapsed * 3) * 0.3);
    if (chewElapsed >= 2.8) {
      slice.visible = false;
    }
  }
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

window.addEventListener("resize", () => {
  const { innerWidth: w, innerHeight: h } = window;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
