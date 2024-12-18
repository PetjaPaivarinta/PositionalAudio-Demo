import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { PositionalAudioHelper } from 'three/addons/helpers/PositionalAudioHelper.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


const listener = new THREE.AudioListener();
camera.add( listener );

const smokeParticlesCount = 200;
// Create a geometry for the smoke particles
const smokeGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(smokeParticlesCount * 3); // Each particle has x, y, z coordinates
const velocities = new Float32Array(smokeParticlesCount * 3); // Store velocity data for each particle

// Position the smoke emitter above the house
const housePosition = new THREE.Vector3(18, 0, 2); // Position of the BoomBox (house)

// Set random positions directly above the house for the smoke particles
for (let i = 0; i < smokeParticlesCount; i++) {
    // Restrict x and z positions around the house, keep them close to the house
    positions[i * 3] = housePosition.x + Math.random() * 1 - 0.5; // x position directly above the house
    positions[i * 3 + 1] = housePosition.y + 3 + Math.random() * 0.5;  // y position (above the house)
    positions[i * 3 + 2] = housePosition.z + Math.random() * 1 - 0.5; // z position directly above the house

    // Random velocity for each particle (simulate upward motion and drift)
    velocities[i * 3] = (Math.random() - 0.05) * 0.01; // x velocity
    velocities[i * 3 + 1] = Math.random() * 0.01 + 0.02; // y velocity (upward)
    velocities[i * 3 + 2] = Math.random() * -0.03 + 0.03; // z velocity (drift)
}

// Add positions and velocities to the geometry
smokeGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
smokeGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 2));

// Create a material for the smoke particles
const smokeMaterial = new THREE.PointsMaterial({
    color: '#3b393b', // Smoke color
    size: 0.7,         // Particle size
    opacity: 0.9,    // Particle opacity
    transparent: true,
    blending: THREE.AdditiveBlending
});

// Create the smoke emitter (a Points object)
const smokeEmitter = new THREE.Points(smokeGeometry, smokeMaterial);
smokeEmitter.position.set(housePosition.x, housePosition.y + 3, housePosition.z); // Position above the house
scene.add(smokeEmitter);


const positionalAudio = new THREE.PositionalAudio( listener );

positionalAudio.setRefDistance( 1 );
positionalAudio.setDirectionalCone( 180, 230, 0.1 );


const helper = new PositionalAudioHelper( positionalAudio, 10);
helper.rotation.y = -250;
// positionalAudio.add( helper ); // enable to add PositionalAudioHelper

const loader = new GLTFLoader();

const dirtTexture = new THREE.TextureLoader().load('Assets/dirt.jpg');
dirtTexture.wrapS = THREE.RepeatWrapping;
dirtTexture.wrapT = THREE.RepeatWrapping;
dirtTexture.repeat.set(50, 50);

const dirtMaterial = new THREE.MeshStandardMaterial({ map: dirtTexture });
const dirtGeometry = new THREE.PlaneGeometry(100, 100);
const dirt = new THREE.Mesh(dirtGeometry, dirtMaterial);
dirt.rotation.x = -Math.PI / 2;
scene.add(dirt);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const controls = new PointerLockControls( camera, renderer.domElement );

controls.pointerSpeed = 0.5;

document.addEventListener('click', () => {
    controls.lock();
    // Start audio playback after user interaction
    const audioElement = document.getElementById('music');
    audioElement.play().then(() => {
        positionalAudio.setMediaElementSource(audioElement);
    }).catch((error) => {
        console.error('Audio playback failed:', error);
    });
}, false);

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

const onKeyDown = (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }
};

const onKeyUp = (event) => {
    switch (event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
};

document.addEventListener('keydown', onKeyDown, false);
document.addEventListener('keyup', onKeyUp, false);

const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();

camera.position.set(0, 1.6, 5);

const clock = new THREE.Clock();

let model;

loader.load('Assets/mountain.glb', function (gltf) {
    model = gltf.scene;
    model.scale.set(20, 20, 20); // Set the scale here
    model.position.set(50, 0, 0); // Set the position here
    model.rotation.y = 349;
    model.position.y= -0.1;
    scene.add(model);
}, function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function (error) {
    console.log('An error happened');
});

loader.load('Assets/BoomBox.glb', function (gltf) {
    const BoomBox = gltf.scene;
    BoomBox.position.set(37, 0, 2); // Set the position here
    BoomBox.rotation.y = 185;
    BoomBox.add(positionalAudio);
    scene.add(BoomBox);

    renderer.setAnimationLoop(animate);
}, function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
}, function (error) {
    console.log('An error happened');
});

const light = new THREE.AmbientLight(0xffffff, 1);
scene.add(light);

const light2 = new THREE.DirectionalLight(0xffffff, 1);
light2.position.set(0, 1, 0);
scene.add(light2);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

function animate() {
    controls.update();

    if (controls.isLocked) {
        const delta = clock.getDelta();
        velocity.x -= velocity.x * 40.0 * delta;
        velocity.z -= velocity.z * 40.0 * delta;

        direction.z = Number(moveForward) - Number(moveBackward);
        direction.x = Number(moveLeft) - Number(moveRight);
        direction.normalize();

        if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
        if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

        controls.moveRight(+velocity.x * delta);
        controls.moveForward(-velocity.z * delta);
    }

    // Update particle positions to simulate rising smoke
    const positionsArray = smokeGeometry.attributes.position.array;
    const velocitiesArray = smokeGeometry.attributes.velocity.array;

    for (let i = 0; i < smokeParticlesCount; i++) {
        // Update particle positions based on velocity
        positionsArray[i * 3] += velocitiesArray[i * 3];     // x position
        positionsArray[i * 3 + 1] += velocitiesArray[i * 3 + 1]; // y position (upward)
        positionsArray[i * 3 + 2] += velocitiesArray[i * 3 + 2]; // z position (drift)

        // Reset particles that go too high
        if (positionsArray[i * 3 + 1] > housePosition.y + 15) {
            // Reset to spawn above the house, keeping within the small range
            positionsArray[i * 3 + 1] = housePosition.y + 3 + Math.random() * 0.5;
            positionsArray[i * 3] = housePosition.x + Math.random() * 1 - 0.5;
            positionsArray[i * 3 + 2] = housePosition.z + Math.random() * 1 - 0.5;
        }
    }

    smokeGeometry.attributes.position.needsUpdate = true; // Make sure the geometry is updated
    renderer.render(scene, camera);
}
